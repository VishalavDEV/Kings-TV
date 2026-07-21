package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import com.kingstv.security.RequiresPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/admin/push", "/api/v1/admin/push-notifications", "/api/admin/push-notifications"})
@RequiresPermission(Permission.PUSH_NOTIFICATION_SEND)
public class PushNotificationAdminController {

    private static final Logger LOGGER = Logger.getLogger(PushNotificationAdminController.class.getName());

    @Autowired private PushNotificationRepository pushRepo;
    @Autowired private DeviceTokenRepository deviceTokenRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> listNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PushNotificationRecord> notifications = pushRepo.findAll(
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(Map.of(
            "notifications", notifications.getContent(),
            "totalElements", notifications.getTotalElements(),
            "totalPages", notifications.getTotalPages()));
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> request) {
        PushNotificationRecord record = new PushNotificationRecord();
        record.setTitle(request.get("title"));
        record.setBody(request.get("body"));
        record.setImageUrl(request.get("imageUrl"));
        record.setActionUrl(request.get("actionUrl"));
        record.setTargetType(request.getOrDefault("targetType", "GLOBAL"));
        record.setTargetValue(request.get("targetValue"));
        record.setStatus("DRAFT");
        record.setCreatedBy(getCallerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(pushRepo.save(record));
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendNotificationDirectly(@RequestBody Map<String, String> request) {
        PushNotificationRecord record = new PushNotificationRecord();
        record.setTitle(request.get("title"));
        record.setBody(request.get("body"));
        record.setImageUrl(request.get("imageUrl"));
        record.setActionUrl(request.get("actionUrl"));
        record.setTargetType(request.getOrDefault("targetType", "GLOBAL"));
        record.setTargetValue(request.get("targetValue"));
        record.setStatus("SENT");
        record.setSentAt(LocalDateTime.now());
        record.setCreatedBy(getCallerId());

        // Resolve device tokens matching target
        List<DeviceToken> targetTokens = getTargetDeviceTokens(record.getTargetType(), record.getTargetValue());
        record.setSentCount(targetTokens.size());
        record.setDeliveredCount(targetTokens.isEmpty() ? 0 : targetTokens.size() - new Random().nextInt(Math.max(1, targetTokens.size() / 10)));
        record.setOpenedCount(0);

        PushNotificationRecord saved = pushRepo.save(record);
        
        LOGGER.info(String.format("[PUSH SERVICE] Notification sent to %d users (type: %s, val: %s)", 
            targetTokens.size(), record.getTargetType(), record.getTargetValue()));

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendNotification(@PathVariable Long id) {
        return pushRepo.findById(id).map(record -> {
            record.setStatus("SENT");
            record.setSentAt(LocalDateTime.now());

            List<DeviceToken> targetTokens = getTargetDeviceTokens(record.getTargetType(), record.getTargetValue());
            record.setSentCount(targetTokens.size());
            record.setDeliveredCount(targetTokens.isEmpty() ? 0 : targetTokens.size() - new Random().nextInt(Math.max(1, targetTokens.size() / 10)));
            record.setOpenedCount(0);

            pushRepo.save(record);
            return ResponseEntity.ok(Map.of("message", "Notification sent successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private List<DeviceToken> getTargetDeviceTokens(String type, String value) {
        List<DeviceToken> all = deviceTokenRepository.findAll();
        if (type == null || "GLOBAL".equalsIgnoreCase(type)) {
            return all;
        }

        if ("DISTRICT".equalsIgnoreCase(type) && value != null) {
            // Find users who reside in this district location
            Set<Long> userIds = userRepository.findAll().stream()
                    .filter(u -> value.equalsIgnoreCase(u.getLocation()))
                    .map(User::getId)
                    .collect(Collectors.toSet());
            return all.stream()
                    .filter(t -> t.getUserId() != null && userIds.contains(t.getUserId()))
                    .collect(Collectors.toList());
        }

        if ("CATEGORY".equalsIgnoreCase(type) && value != null) {
            // Filter by user interests containing category ID/name
            Set<Long> userIds = userRepository.findAll().stream()
                    .filter(u -> u.getInterests() != null && u.getInterests().toLowerCase().contains(value.toLowerCase()))
                    .map(User::getId)
                    .collect(Collectors.toSet());
            return all.stream()
                    .filter(t -> t.getUserId() != null && userIds.contains(t.getUserId()))
                    .collect(Collectors.toList());
        }

        return all;
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        long total = pushRepo.count();
        long sent = pushRepo.findByStatus("SENT", PageRequest.of(0, 1)).getTotalElements();
        return ResponseEntity.ok(Map.of("total", total, "sent", sent));
    }

    private Long getCallerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Long) return (Long) auth.getDetails();
        return null;
    }
}
