package com.kingstv.security;

import com.kingstv.models.ApiLog;
import com.kingstv.repository.ApiLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    @Autowired
    private ApiLogRepository apiLogRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            String uri = request.getRequestURI();
            String method = request.getMethod();

            // Exclude static resources and assets files (e.g. css, js, images, uploads)
            if (!uri.contains(".") && !uri.startsWith("/uploads/") && !uri.startsWith("/assets/")) {
                try {
                    // Sampling logic: always log errors (status >= 400) or slow requests (> 1000ms)
                    // Sample fast 2xx/3xx requests at 10% rate
                    boolean shouldLog = (status >= 400) || (duration > 1000) || (ThreadLocalRandom.current().nextDouble() < 0.10);

                    if (shouldLog) {
                        String callerType = "public";
                        if (uri.contains("/api/admin/") || uri.contains("/api/v1/admin/")) {
                            callerType = "admin";
                        } else if (uri.contains("/cron/") || uri.contains("/ws/")) {
                            callerType = "system";
                        }

                        ApiLog apiLog = new ApiLog(uri, method, status, duration, callerType);
                        apiLogRepository.save(apiLog);
                    }
                } catch (Exception e) {
                    System.err.println("API logging failed: " + e.getMessage());
                }
            }
        }
    }
}
