package com.kingstv.controllers.admin;

import com.kingstv.models.RefreshToken;
import com.kingstv.models.Role;
import com.kingstv.models.User;
import com.kingstv.repository.RefreshTokenRepository;
import com.kingstv.repository.RoleRepository;
import com.kingstv.repository.UserRepository;
import com.kingstv.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dedicated Admin Auth endpoints — separate from public user auth.
 * Only users with admin roles (not READER) can obtain tokens here.
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    // Admin roles that are permitted to log in via the admin portal
    private static final Set<String> ADMIN_ROLES = Set.of(
        "SUPER_ADMIN", "CHIEF_EDITOR", "DISTRICT_ADMIN", "MOBILE_JOURNALIST", "INSTITUTION_LOGIN"
    );

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    /**
     * POST /api/admin/auth/login
     * Validates email + password, checks the user has an admin role,
     * returns a 24h JWT + refresh token with module-key permissions embedded.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();

        // Block non-admin roles from logging in here
        if (!ADMIN_ROLES.contains(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. This portal is for administrators only."));
        }

        if (!user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account has been suspended. Contact the system administrator."));
        }

        if (!passwordMatches(password, user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        // Get module-key permissions for this user's role
        List<String> moduleKeys = getModulePermissions(user.getRole());

        // Generate 24h admin JWT
        String jwt = jwtUtil.generateAdminToken(
            user.getEmail(), user.getRole(), user.getId(), moduleKeys
        );

        // Issue/refresh the refresh token
        String refreshToken = createRefreshToken(user);

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", jwt);
        response.put("refreshToken", refreshToken);

        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole());
        userInfo.put("profileImage", user.getProfileImage());
        userInfo.put("permissions", moduleKeys);
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/auth/refresh
     * Accepts a valid refresh token UUID and returns a new JWT.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshTokenStr = body.get("refreshToken");
        if (refreshTokenStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "refreshToken is required"));
        }

        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshTokenStr);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired refresh token"));
        }

        RefreshToken refreshToken = tokenOpt.get();
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Refresh token has expired. Please log in again."));
        }

        User user = refreshToken.getUser();
        if (!ADMIN_ROLES.contains(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<String> moduleKeys = getModulePermissions(user.getRole());
        String newJwt = jwtUtil.generateAdminToken(
            user.getEmail(), user.getRole(), user.getId(), moduleKeys
        );

        return ResponseEntity.ok(Map.of("token", newJwt));
    }

    /**
     * GET /api/admin/auth/me
     * Returns the current admin's profile and their module permissions.
     * Used by the frontend to build the dynamic sidebar.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        String email = (String) auth.getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        List<String> moduleKeys = getModulePermissions(user.getRole());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("profileImage", user.getProfileImage());
        response.put("permissions", moduleKeys);
        response.put("lastLogin", user.getLastLogin());

        return ResponseEntity.ok(response);
    }

    // ---- Helpers ----

    /**
     * Checks the given plain-text password against both the 'password' and 'password_hash'
     * columns to handle users created by different flows.
     */
    private boolean passwordMatches(String rawPassword, User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            try {
                if (passwordEncoder.matches(rawPassword, user.getPassword())) return true;
            } catch (Exception ignored) {}
        }
        if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) {
            try {
                if (passwordEncoder.matches(rawPassword, user.getPasswordHash())) return true;
            } catch (Exception ignored) {}
        }
        return false;
    }

    private List<String> getModulePermissions(String roleName) {
        // SUPER_ADMIN gets all module keys
        if ("SUPER_ADMIN".equals(roleName)) {
            return List.of(
                "admin_panel", "add_post", "manage_all_posts", "navigation", "pages",
                "rss_feeds", "categories", "widgets", "polls", "gallery", "comments",
                "contact_messages", "newsletter", "reward_system", "ad_spaces",
                "users", "roles_permissions", "seo_tools", "social_login", "languages", "settings"
            );
        }

        // For other roles, look up their permissions and filter to module keys
        return roleRepository.findByName(roleName)
            .map(role -> role.getPermissions().stream()
                .map(com.kingstv.models.Permission::getName)
                .filter(name -> isModuleKey(name))
                .collect(Collectors.toList()))
            .orElse(Collections.emptyList());
    }

    private boolean isModuleKey(String name) {
        return Set.of(
            "admin_panel", "add_post", "manage_all_posts", "navigation", "pages",
            "rss_feeds", "categories", "widgets", "polls", "gallery", "comments",
            "contact_messages", "newsletter", "reward_system", "ad_spaces",
            "users", "roles_permissions", "seo_tools", "social_login", "languages", "settings"
        ).contains(name);
    }

    private String createRefreshToken(User user) {
        Optional<RefreshToken> existing = refreshTokenRepository.findByUser(user);
        existing.ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(30)); // 30d refresh for admin
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
