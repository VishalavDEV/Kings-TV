package com.kingstv.security;

import com.kingstv.models.UserActivity;
import com.kingstv.repository.UserActivityRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminActivityInterceptor implements HandlerInterceptor {

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            // Log only if authenticated and requesting admin API
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof String) {
                String uri = request.getRequestURI();
                
                // Exclude authentication endpoints to keep the trail clear of credentials exchanges
                if ((uri.contains("/api/admin/") || uri.contains("/api/v1/admin/")) && !uri.contains("/auth/")) {
                    Long userId = null;
                    Object details = auth.getDetails();
                    if (details instanceof Long) {
                        userId = (Long) details;
                    }

                    if (userId != null) {
                        String method = request.getMethod();
                        String type = "GET".equalsIgnoreCase(method) ? "page_view" : "action";
                        String endpoint = method + " " + uri;

                        UserActivity activity = new UserActivity(userId, type, endpoint);
                        userActivityRepository.save(activity);
                    }
                }
            }
        } catch (Exception e) {
            // Interceptor failures should never block request lifecycle
            System.err.println("UserActivity logging failed: " + e.getMessage());
        }
        return true;
    }
}
