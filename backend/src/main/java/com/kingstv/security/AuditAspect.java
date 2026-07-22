package com.kingstv.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kingstv.models.AuditLog;
import com.kingstv.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Around("within(com.kingstv.controllers.admin..*) && " +
            "!within(com.kingstv.controllers.admin.AdminAuthController) && " +
            "!within(com.kingstv.controllers.admin.AuditLogController) && " +
            "(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            " @annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            " @annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
            " @annotation(org.springframework.web.bind.annotation.PatchMapping))")
    public Object logAdminWrite(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getRequest();
        
        // 1. Resolve entity name and action
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Class<?> controllerClass = joinPoint.getTarget().getClass();

        String action = "update";
        if (method.isAnnotationPresent(PostMapping.class)) {
            action = "create";
        } else if (method.isAnnotationPresent(DeleteMapping.class)) {
            action = "delete";
        }

        String entityType = resolveEntityName(controllerClass);

        // Allow overriding via @Auditable if present
        if (method.isAnnotationPresent(Auditable.class)) {
            Auditable auditable = method.getAnnotation(Auditable.class);
            action = auditable.action().toLowerCase();
            entityType = auditable.entity();
        }

        // 2. Extract ID if updating or deleting
        Long entityId = extractIdFromRequest(request, joinPoint.getArgs());

        // 3. Capture before_value JSON snapshot
        String beforeJson = null;
        if (entityId != null && ("update".equals(action) || "delete".equals(action))) {
            try {
                Object beforeEntity = fetchEntityFromDb(entityType, entityId);
                if (beforeEntity != null) {
                    beforeJson = objectMapper.writeValueAsString(beforeEntity);
                }
            } catch (Exception e) {
                System.err.println("Audit before-snapshot error: " + e.getMessage());
            }
        }

        // 4. Proceed with execution
        Object result = joinPoint.proceed();

        // 5. Capture after_value JSON snapshot
        String afterJson = null;
        if ("create".equals(action) || "update".equals(action)) {
            try {
                Object afterEntity = null;
                if (result instanceof ResponseEntity) {
                    afterEntity = ((ResponseEntity<?>) result).getBody();
                } else {
                    afterEntity = result;
                }

                // If result is empty or just a map (common response wrapper), fallback to DB
                if (afterEntity == null || afterEntity instanceof Map) {
                    // Try to guess/extract ID from result or method args
                    Long newId = entityId != null ? entityId : extractIdFromResult(afterEntity, joinPoint.getArgs());
                    if (newId != null) {
                        afterEntity = fetchEntityFromDb(entityType, newId);
                        entityId = newId;
                    }
                }

                if (afterEntity != null && !(afterEntity instanceof Map)) {
                    afterJson = objectMapper.writeValueAsString(afterEntity);
                }
            } catch (Exception e) {
                System.err.println("Audit after-snapshot error: " + e.getMessage());
            }
        }

        // 6. Save audit record
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String actorEmail = "system";
            String actorRole = "SYSTEM";
            Long actorId = null;

            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof String) {
                actorEmail = (String) auth.getPrincipal();
                actorRole = auth.getAuthorities().stream()
                        .filter(a -> a.getAuthority().startsWith("ROLE_"))
                        .map(a -> a.getAuthority().substring(5))
                        .findFirst()
                        .orElse("UNKNOWN");

                Object details = auth.getDetails();
                if (details instanceof Long) {
                    actorId = (Long) details;
                }
            }

            AuditLog log = new AuditLog();
            log.setActorId(actorId);
            log.setActorEmail(actorEmail);
            log.setActorRole(actorRole);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setBeforeValue(beforeJson);
            log.setAfterValue(afterJson);
            log.setIpAddress(getClientIp(request));
            log.setDetails(String.format("Auto-logged write: %s on %s", action, entityType));

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Audit database save failed: " + e.getMessage());
        }

        return result;
    }

    // Helper method to guess model from controller class name
    private String resolveEntityName(Class<?> controllerClass) {
        String name = controllerClass.getSimpleName();
        if (name.startsWith("Admin")) {
            name = name.substring(5);
        }
        if (name.endsWith("Controller")) {
            name = name.substring(0, name.length() - 10);
        }
        
        // Manual mappings for deviations
        switch (name) {
            case "BusinessListing": return "DirectoryListing";
            case "AdSpace": return "AdSpace";
            case "SocialLogin":
            case "RouteSettings":
            case "System":
            case "Settings":
            case "SystemConfig":
                return "SystemConfig";
            case "Preferences": return "UserPreference";
            case "RewardSystem": return "RewardSettings";
            case "PushNotificationAdmin": return "PushNotificationRecord";
            case "ObituariesWishes": return "Obituary";
            default: return name;
        }
    }

    private Object fetchEntityFromDb(String entityName, Long id) {
        if (id == null) return null;
        try {
            String repoBeanName = firstLetterLowercase(entityName) + "Repository";
            
            // Manual overrides for repositories that deviate
            if ("DirectoryListing".equals(entityName)) repoBeanName = "directoryRepository";
            if ("SystemConfig".equals(entityName)) repoBeanName = "systemConfigRepository";
            if ("PushNotificationRecord".equals(entityName)) repoBeanName = "pushNotificationRepository";
            
            Object repo = applicationContext.getBean(repoBeanName);
            if (repo instanceof JpaRepository) {
                JpaRepository<?, Long> jpaRepo = (JpaRepository<?, Long>) repo;
                return jpaRepo.findById(id).orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Long extractIdFromRequest(HttpServletRequest request, Object[] args) {
        if (request != null) {
            try {
                Map<?, ?> pathVars = (Map<?, ?>) request.getAttribute(org.springframework.web.servlet.HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
                if (pathVars != null) {
                    if (pathVars.containsKey("id")) {
                        return Long.parseLong(pathVars.get("id").toString());
                    }
                    for (Object key : pathVars.keySet()) {
                        if (key.toString().toLowerCase().contains("id")) {
                            return Long.parseLong(pathVars.get(key).toString());
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof Long) {
                    return (Long) arg;
                }
            }
        }
        return null;
    }

    private Long extractIdFromResult(Object result, Object[] args) {
        if (result != null) {
            try {
                Method getId = result.getClass().getMethod("getId");
                Object id = getId.invoke(result);
                if (id instanceof Long) return (Long) id;
            } catch (Exception ignored) {}
        }
        if (args != null) {
            for (Object arg : args) {
                if (arg != null) {
                    try {
                        Method getId = arg.getClass().getMethod("getId");
                        Object id = getId.invoke(arg);
                        if (id instanceof Long) return (Long) id;
                    } catch (Exception ignored) {}
                }
            }
        }
        return null;
    }

    private String firstLetterLowercase(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toLowerCase(s.charAt(0)) + s.substring(1);
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                return attrs.getRequest();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String xff = request.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
