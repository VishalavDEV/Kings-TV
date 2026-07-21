package com.kingstv.controllers.admin;

import com.kingstv.models.NewsletterSubscriber;
import com.kingstv.models.User;
import com.kingstv.repository.NewsletterSubscriberRepository;
import com.kingstv.repository.UserRepository;
import com.kingstv.services.EmailService;
import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/newsletter")
public class AdminNewsletterController {

    @Autowired private NewsletterSubscriberRepository subscriberRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;
    @Autowired private SystemConfigService configService;

    @GetMapping("/subscribers")
    public ResponseEntity<?> getSubscribers() {
        List<NewsletterSubscriber> subscribers = subscriberRepository.findAll(Sort.by("createdAt").descending());
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> registeredAdmins = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getFullName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("subscribers", subscribers);
        res.put("registeredUsers", registeredAdmins);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/subscribers/{id}")
    public ResponseEntity<?> deleteSubscriber(@PathVariable Long id) {
        if (!subscriberRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        subscriberRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Subscriber deleted"));
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> recipients = (List<String>) body.get("recipients");
        String subject = (String) body.get("subject");
        String message = (String) body.get("message");

        if (recipients == null || recipients.isEmpty() || subject == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "recipients, subject, and message are required"));
        }

        int count = 0;
        for (String email : recipients) {
            emailService.sendSimpleMessage(email, subject, message);
            count++;
        }

        return ResponseEntity.ok(Map.of("message", "Email sent successfully to " + count + " recipient(s)", "count", count));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        String enabled = configService.getConfigValueOrDefault("newsletter.enabled", "true");
        String popupEnabled = configService.getConfigValueOrDefault("newsletter.popup_enabled", "true");
        return ResponseEntity.ok(Map.of(
            "newsletterEnabled", "true".equalsIgnoreCase(enabled),
            "popupEnabled", "true".equalsIgnoreCase(popupEnabled)
        ));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.getOrDefault("newsletterEnabled", true);
        Boolean popupEnabled = body.getOrDefault("popupEnabled", true);

        configService.setConfigValue("newsletter.enabled", String.valueOf(enabled), "newsletter", null, null);
        configService.setConfigValue("newsletter.popup_enabled", String.valueOf(popupEnabled), "newsletter", null, null);

        return ResponseEntity.ok(Map.of("message", "Newsletter settings saved successfully"));
    }
}
