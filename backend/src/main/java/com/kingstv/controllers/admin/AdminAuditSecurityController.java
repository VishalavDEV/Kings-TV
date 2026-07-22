package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import com.kingstv.security.RequiresPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/audit-logs", "/api/v1/admin/audit-logs-custom"}) // fallback mappings
@RequiresPermission(anyOf = {Role.SUPER_ADMIN})
public class AdminAuditSecurityController {

    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private LoginLogRepository loginLogRepository;
    @Autowired private UserActivityRepository userActivityRepository;
    @Autowired private SecurityEventRepository securityEventRepository;
    @Autowired private ApiLogRepository apiLogRepository;
    @Autowired private UserRepository userRepository;

    // Helper to parse local date time securely
    private LocalDateTime parseDate(String dateStr, boolean isEnd) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.length() == 10) {
                // yyyy-MM-dd format
                return isEnd ? 
                    LocalDateTime.parse(dateStr + "T23:59:59") : 
                    LocalDateTime.parse(dateStr + "T00:00:00");
            }
            return LocalDateTime.parse(dateStr);
        } catch (Exception ignored) {}
        return null;
    }

    // 1. Audit Logs Endpoint
    @GetMapping("")
    public ResponseEntity<?> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actor != null && !actor.isBlank()) {
                try {
                    Long actorId = Long.parseLong(actor);
                    predicates.add(cb.equal(root.get("actorId"), actorId));
                } catch (NumberFormatException e) {
                    predicates.add(cb.like(cb.lower(root.get("actorEmail")), "%" + actor.toLowerCase() + "%"));
                }
            }
            if (role != null && !role.isBlank()) {
                predicates.add(cb.equal(root.get("actorRole"), role));
            }
            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("action")), term),
                    cb.like(cb.lower(root.get("entityType")), term),
                    cb.like(cb.lower(root.get("ipAddress")), term),
                    cb.like(cb.lower(root.get("actorEmail")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> result = auditLogRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(Map.of(
            "logs", result.getContent(),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements(),
            "currentPage", page
        ));
    }

    // 2. Login Logs Endpoint
    @GetMapping("/logins")
    public ResponseEntity<?> listLoginLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Boolean success,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<LoginLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (email != null && !email.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("emailAttempted")), "%" + email.toLowerCase() + "%"));
            }
            if (success != null) {
                predicates.add(cb.equal(root.get("success"), success));
            }
            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("emailAttempted")), term),
                    cb.like(cb.lower(root.get("ipAddress")), term),
                    cb.like(cb.lower(root.get("failureReason")), term),
                    cb.like(cb.lower(root.get("userAgent")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LoginLog> result = loginLogRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(Map.of(
            "logs", result.getContent(),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements(),
            "currentPage", page
        ));
    }

    // 3. User Activities Endpoint
    @GetMapping("/activities")
    public ResponseEntity<?> listUserActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<UserActivity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actor != null && !actor.isBlank()) {
                try {
                    Long actorId = Long.parseLong(actor);
                    predicates.add(cb.equal(root.get("adminUserId"), actorId));
                } catch (NumberFormatException e) {
                    // Search email dynamically from User mapping
                    // Subquery to check matching emails in users table
                    jakarta.persistence.criteria.Subquery<Long> subquery = query.subquery(Long.class);
                    jakarta.persistence.criteria.Root<User> subRoot = subquery.from(User.class);
                    subquery.select(subRoot.get("id"));
                    subquery.where(cb.like(cb.lower(subRoot.get("email")), "%" + actor.toLowerCase() + "%"));
                    predicates.add(root.get("adminUserId").in(subquery));
                }
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("activityType"), type));
            }
            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("pageOrEndpoint")), term),
                    cb.like(cb.lower(root.get("activityType")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserActivity> pageResult = userActivityRepository.findAll(spec, pageRequest);
        
        // Map activities to response payload including user email for the frontend
        List<Map<String, Object>> contentList = new ArrayList<>();
        for (UserActivity act : pageResult.getContent()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", act.getId());
            map.put("adminUserId", act.getAdminUserId());
            map.put("activityType", act.getActivityType());
            map.put("pageOrEndpoint", act.getPageOrEndpoint());
            map.put("createdAt", act.getCreatedAt());
            
            // Enrich with email
            String email = userRepository.findById(act.getAdminUserId())
                    .map(User::getEmail).orElse("unknown");
            map.put("adminEmail", email);
            contentList.add(map);
        }

        return ResponseEntity.ok(Map.of(
            "logs", contentList,
            "totalPages", pageResult.getTotalPages(),
            "totalElements", pageResult.getTotalElements(),
            "currentPage", page
        ));
    }

    // 4. Security Events Endpoint
    @GetMapping("/security")
    public ResponseEntity<?> listSecurityEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<SecurityEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (severity != null && !severity.isBlank()) {
                predicates.add(cb.equal(root.get("severity"), severity.toLowerCase()));
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(root.get("eventType"), type));
            }
            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("eventType")), term),
                    cb.like(cb.lower(root.get("details")), term),
                    cb.like(cb.lower(root.get("ipAddress")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SecurityEvent> result = securityEventRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(Map.of(
            "logs", result.getContent(),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements(),
            "currentPage", page
        ));
    }

    // 5. API Logs Endpoint (General list)
    @GetMapping("/api-traffic")
    public ResponseEntity<?> listApiLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer statusCode,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<ApiLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (statusCode != null) {
                predicates.add(cb.equal(root.get("statusCode"), statusCode));
            }
            if (method != null && !method.isBlank()) {
                predicates.add(cb.equal(root.get("method"), method.toUpperCase()));
            }
            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("endpoint")), term),
                    cb.like(cb.lower(root.get("callerType")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ApiLog> result = apiLogRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(Map.of(
            "logs", result.getContent(),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements(),
            "currentPage", page
        ));
    }

    // 6. Failed Requests (API logs where status >= 400)
    @GetMapping("/failures")
    public ResponseEntity<?> listFailedRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<ApiLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.greaterThanOrEqualTo(root.get("statusCode"), 400));

            LocalDateTime start = parseDate(startDate, false);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            LocalDateTime end = parseDate(endDate, true);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("endpoint")), term),
                    cb.like(cb.lower(root.get("method")), term),
                    cb.like(cb.lower(root.get("callerType")), term)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ApiLog> result = apiLogRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(Map.of(
            "logs", result.getContent(),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements(),
            "currentPage", page
        ));
    }
}
