package com.kingstv.controllers;

import com.kingstv.models.User;
import com.kingstv.models.RefreshToken;
import com.kingstv.models.PasswordResetOtp;
import com.kingstv.repository.UserRepository;
import com.kingstv.repository.RefreshTokenRepository;
import com.kingstv.repository.PasswordResetOtpRepository;
import com.kingstv.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

import com.kingstv.models.AuditLog;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.kingstv.repository.RoleRepository roleRepository;

    @Autowired
    private com.kingstv.repository.AuditLogRepository auditLogRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private String createRefreshToken(User user) {
        Optional<RefreshToken> existing = refreshTokenRepository.findByUser(user);
        existing.ifPresent(token -> refreshTokenRepository.delete(token));

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private List<String> getUserPermissions(User user) {
        return roleRepository.findByName(user.getRole())
                .map(role -> role.getPermissions().stream()
                        .map(com.kingstv.models.Permission::getName)
                        .collect(java.util.stream.Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");

        if (fullName == null || fullName.trim().isEmpty() || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full Name, Email, and Password are required"));
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email address format"));
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters long"));
        }

        if (userRepository.findByEmail(email.toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email is already registered"));
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("READER"); // seed as READER by default
        user.setProvider("LOCAL");
        user.setIsVerified(false);
        user.setIsActive(true);
        user.setLastLogin(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String accessToken = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId(), getUserPermissions(savedUser));
        String refreshToken = createRefreshToken(savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", Map.of(
            "id", savedUser.getId(),
            "fullName", savedUser.getFullName(),
            "email", savedUser.getEmail(),
            "provider", savedUser.getProvider(),
            "role", savedUser.getRole(),
            "profileImage", savedUser.getProfileImage() != null ? savedUser.getProfileImage() : "",
            "createdAt", savedUser.getCreatedAt() != null ? savedUser.getCreatedAt().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10),
            "lastLogin", savedUser.getLastLogin() != null ? savedUser.getLastLogin().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10)
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and Password are required"));
        }

        email = email.trim();

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (!user.getProvider().equals("LOCAL")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please log in using your " + user.getProvider() + " account"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        user.setLastLogin(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        String accessToken = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId(), getUserPermissions(savedUser));
        String refreshToken = createRefreshToken(savedUser);

        // Record Audit Log entry for login action
        try {
            AuditLog log = new AuditLog();
            log.setActorId(savedUser.getId());
            log.setActorEmail(savedUser.getEmail());
            log.setActorRole(savedUser.getRole());
            log.setActionType("LOGIN");
            log.setEntityType("USER");
            log.setEntityId(savedUser.getId());
            log.setDetails("Logged in successfully via LOCAL credentials");
            log.setIpAddress(httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1");
            auditLogRepository.save(log);
        } catch (Exception ex) {
            System.err.println("Audit log save failed: " + ex.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", Map.of(
            "id", savedUser.getId(),
            "fullName", savedUser.getFullName(),
            "email", savedUser.getEmail(),
            "provider", savedUser.getProvider(),
            "role", savedUser.getRole(),
            "profileImage", savedUser.getProfileImage() != null ? savedUser.getProfileImage() : "",
            "createdAt", savedUser.getCreatedAt() != null ? savedUser.getCreatedAt().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10),
            "lastLogin", savedUser.getLastLogin() != null ? savedUser.getLastLogin().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10)
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String refreshTokenVal = request.get("refreshToken");
        if (refreshTokenVal != null) {
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshTokenVal);
            tokenOpt.ifPresent(token -> refreshTokenRepository.delete(token));
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String tokenVal = request.get("refreshToken");
        if (tokenVal == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Refresh Token is required"));
        }

        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(tokenVal);
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Expired or invalid refresh token"));
        }

        User user = tokenOpt.get().getUser();
        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId(), getUserPermissions(user));
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken, "refreshToken", tokenVal));
    }

    private ResponseEntity<?> processSocialLogin(String email, String name, String profileImage, String provider) {
        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and name are required from social provider"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.getProvider().equals("LOCAL")) {
                user.setProvider(provider);
            }
            if (profileImage != null && (user.getProfileImage() == null || user.getProfileImage().isEmpty())) {
                user.setProfileImage(profileImage);
            }
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            user = new User();
            user.setFullName(name);
            user.setEmail(email.toLowerCase());
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setProvider(provider);
            user.setProfileImage(profileImage != null ? profileImage : "");
            user.setRole("READER");
            user.setIsVerified(true);
            user.setIsActive(true);
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        }

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId(), getUserPermissions(user));
        String refreshToken = createRefreshToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Social login successful");
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", Map.of(
            "id", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail(),
            "provider", user.getProvider(),
            "role", user.getRole(),
            "profileImage", user.getProfileImage() != null ? user.getProfileImage() : "",
            "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10),
            "lastLogin", user.getLastLogin() != null ? user.getLastLogin().toString().substring(0, 10) : LocalDateTime.now().toString().substring(0, 10)
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        return processSocialLogin(request.get("email"), request.get("name"), request.get("profileImage"), "GOOGLE");
    }

    @PostMapping("/apple")
    public ResponseEntity<?> appleLogin(@RequestBody Map<String, String> request) {
        return processSocialLogin(request.get("email"), request.get("name"), null, "APPLE");
    }

    @PostMapping("/facebook")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> request) {
        return processSocialLogin(request.get("email"), request.get("name"), request.get("profileImage"), "FACEBOOK");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No account registered with this email address"));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        
        List<PasswordResetOtp> existingOtps = otpRepository.findByEmail(email.toLowerCase());
        if (!existingOtps.isEmpty()) {
            otpRepository.deleteAll(existingOtps);
        }

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(email.toLowerCase());
        resetOtp.setOtpCode(otp);
        resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        resetOtp.setIsVerified(false);
        otpRepository.save(resetOtp);

        System.out.println("==========================================");
        System.out.println("PASSWORD RESET OTP FOR " + email + ": " + otp);
        System.out.println("==========================================");

        return ResponseEntity.ok(Map.of("message", "Password reset OTP has been sent. Please check your console logs."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP code are required"));
        }

        Optional<PasswordResetOtp> otpOpt = otpRepository.findByEmailAndOtpCode(email.toLowerCase(), otp);
        if (otpOpt.isEmpty() || otpOpt.get().getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired OTP code"));
        }

        PasswordResetOtp resetOtp = otpOpt.get();
        resetOtp.setIsVerified(true);
        otpRepository.save(resetOtp);

        return ResponseEntity.ok(Map.of("message", "OTP verified successfully. You can now reset your password."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email, OTP, and New Password are required"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters long"));
        }

        Optional<PasswordResetOtp> otpOpt = otpRepository.findByEmailAndOtpCode(email.toLowerCase(), otp);
        if (otpOpt.isEmpty() || !otpOpt.get().getIsVerified()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "OTP has not been verified. Cannot reset password."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpRepository.delete(otpOpt.get());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in with your new password."));
    }
}
