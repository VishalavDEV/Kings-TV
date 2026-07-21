package com.kingstv.services;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Service
public class RateLimiterService {
    private static final Logger LOGGER = Logger.getLogger(RateLimiterService.class.getName());
    
    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    public static class AttemptInfo {
        public int count;
        public LocalDateTime lastAttempt;
        public LocalDateTime lockoutEnd;

        public AttemptInfo() {
            this.count = 1;
            this.lastAttempt = LocalDateTime.now();
            this.lockoutEnd = null;
        }
    }

    public boolean isLockedOut(String ip, String email) {
        String key = ip + ":" + email.toLowerCase().trim();
        AttemptInfo info = attempts.get(key);
        if (info == null) return false;
        
        if (info.lockoutEnd != null) {
            if (LocalDateTime.now().isBefore(info.lockoutEnd)) {
                return true;
            } else {
                info.lockoutEnd = null;
                info.count = 0;
            }
        }
        return false;
    }

    public void recordFailedAttempt(String ip, String email) {
        String key = ip + ":" + email.toLowerCase().trim();
        attempts.compute(key, (k, info) -> {
            if (info == null) {
                return new AttemptInfo();
            }
            info.count++;
            info.lastAttempt = LocalDateTime.now();
            if (info.count >= MAX_ATTEMPTS) {
                info.lockoutEnd = LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES);
                LOGGER.warning(String.format(
                    "[SECURITY ALERT] Account login locked out for IP: %s, Account: %s due to %d failed attempts.",
                    ip, email, info.count
                ));
            }
            return info;
        });
        
        LOGGER.info(String.format(
            "[SECURITY INFO] Failed login attempt logged. IP: %s, Account: %s",
            ip, email
        ));
    }

    public void recordSuccess(String ip, String email) {
        String key = ip + ":" + email.toLowerCase().trim();
        attempts.remove(key);
    }
}
