package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reward-system")
public class AdminRewardSystemController {

    @Autowired private RewardSettingsRepository rewardSettingsRepository;
    @Autowired private PayoutMethodRepository payoutMethodRepository;
    @Autowired private AuthorEarningRepository authorEarningRepository;
    @Autowired private PayoutRepository payoutRepository;
    @Autowired private PageviewLogRepository pageviewLogRepository;
    @Autowired private UserRepository userRepository;

    // --- 1. Settings ---
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        List<RewardSettings> list = rewardSettingsRepository.findAll();
        if (list.isEmpty()) {
            RewardSettings defaultSettings = new RewardSettings();
            rewardSettingsRepository.save(defaultSettings);
            return ResponseEntity.ok(defaultSettings);
        }
        return ResponseEntity.ok(list.get(0));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody RewardSettings payload) {
        List<RewardSettings> list = rewardSettingsRepository.findAll();
        RewardSettings settings = list.isEmpty() ? new RewardSettings() : list.get(0);

        if (payload.getStatus() != null) settings.setStatus(payload.getStatus());
        if (payload.getRewardAmountPer1000Views() != null) settings.setRewardAmountPer1000Views(payload.getRewardAmountPer1000Views());
        if (payload.getCurrencyName() != null) settings.setCurrencyName(payload.getCurrencyName());
        if (payload.getCurrencySymbol() != null) settings.setCurrencySymbol(payload.getCurrencySymbol());
        if (payload.getCurrencyFormat() != null) settings.setCurrencyFormat(payload.getCurrencyFormat());
        if (payload.getSymbolPosition() != null) settings.setSymbolPosition(payload.getSymbolPosition());

        RewardSettings saved = rewardSettingsRepository.save(settings);
        return ResponseEntity.ok(saved);
    }

    // --- 2. Payout Methods ---
    @GetMapping("/payout-methods")
    public ResponseEntity<?> getPayoutMethods() {
        List<PayoutMethod> methods = payoutMethodRepository.findAll();
        if (methods.isEmpty()) {
            // Seed default PayPal, IBAN, SWIFT
            for (String name : List.of("PayPal", "IBAN", "SWIFT")) {
                PayoutMethod pm = new PayoutMethod();
                pm.setMethodName(name);
                pm.setEnabled(true);
                payoutMethodRepository.save(pm);
            }
            methods = payoutMethodRepository.findAll();
        }
        return ResponseEntity.ok(methods);
    }

    @PutMapping("/payout-methods/{id}")
    public ResponseEntity<?> updatePayoutMethod(@PathVariable Long id, @RequestBody PayoutMethod payload) {
        return payoutMethodRepository.findById(id).map(pm -> {
            if (payload.getEnabled() != null) pm.setEnabled(payload.getEnabled());
            if (payload.getAccountDetails() != null) pm.setAccountDetails(payload.getAccountDetails());
            PayoutMethod saved = payoutMethodRepository.save(pm);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/payout-methods")
    public ResponseEntity<?> updateAllPayoutMethods(@RequestBody List<PayoutMethod> list) {
        for (PayoutMethod pm : list) {
            if (pm.getId() != null) {
                payoutMethodRepository.findById(pm.getId()).ifPresent(existing -> {
                    if (pm.getEnabled() != null) existing.setEnabled(pm.getEnabled());
                    if (pm.getAccountDetails() != null) existing.setAccountDetails(pm.getAccountDetails());
                    payoutMethodRepository.save(existing);
                });
            }
        }
        return ResponseEntity.ok(payoutMethodRepository.findAll());
    }

    // --- 3. Author Earnings ---
    @GetMapping("/earnings")
    public ResponseEntity<?> getAuthorEarnings() {
        List<AuthorEarning> allEarnings = authorEarningRepository.findAll();

        Map<Long, Map<String, Object>> authorMap = new LinkedHashMap<>();

        for (AuthorEarning ae : allEarnings) {
            Long authorId = ae.getAuthorId() != null ? ae.getAuthorId() : 0L;
            authorMap.putIfAbsent(authorId, new LinkedHashMap<>());
            Map<String, Object> entry = authorMap.get(authorId);
            entry.put("authorId", authorId);
            entry.put("authorName", ae.getAuthorName() != null ? ae.getAuthorName() : "Unknown Author");

            long currentViews = (long) entry.getOrDefault("totalViews", 0L) + (ae.getPageviewCount() != null ? ae.getPageviewCount() : 0L);
            entry.put("totalViews", currentViews);

            BigDecimal currentEarnings = (BigDecimal) entry.getOrDefault("totalEarnings", BigDecimal.ZERO);
            BigDecimal added = ae.getEarningsAmount() != null ? ae.getEarningsAmount() : BigDecimal.ZERO;
            entry.put("totalEarnings", currentEarnings.add(added));
        }

        // Also add users who have written articles
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (!authorMap.containsKey(u.getId())) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("authorId", u.getId());
                entry.put("authorName", u.getFullName());
                entry.put("email", u.getEmail());
                entry.put("totalViews", 0L);
                entry.put("totalEarnings", BigDecimal.ZERO);
                authorMap.put(u.getId(), entry);
            } else {
                authorMap.get(u.getId()).put("email", u.getEmail());
            }
        }

        return ResponseEntity.ok(authorMap.values());
    }

    // --- 4. Payouts ---
    @GetMapping("/payouts")
    public ResponseEntity<?> getPayouts() {
        return ResponseEntity.ok(payoutRepository.findAll(Sort.by("requestedAt").descending()));
    }

    @PostMapping("/payouts")
    public ResponseEntity<?> createPayout(@RequestBody Payout payload) {
        if (payload.getAmount() == null || payload.getMethod() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount and method are required"));
        }
        if (payload.getAuthorName() == null || payload.getAuthorName().isBlank()) {
            if (payload.getAuthorId() != null) {
                userRepository.findById(payload.getAuthorId()).ifPresent(u -> payload.setAuthorName(u.getFullName()));
            }
        }
        payload.setRequestedAt(LocalDateTime.now());
        if ("PAID".equalsIgnoreCase(payload.getStatus())) {
            payload.setPaidAt(LocalDateTime.now());
        }
        Payout saved = payoutRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/payouts/{id}/status")
    public ResponseEntity<?> updatePayoutStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) return ResponseEntity.badRequest().body(Map.of("message", "status is required"));

        return payoutRepository.findById(id).map(p -> {
            p.setStatus(newStatus.toUpperCase());
            if ("PAID".equalsIgnoreCase(newStatus)) {
                p.setPaidAt(LocalDateTime.now());
            }
            Payout saved = payoutRepository.save(p);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- 5. Pageviews ---
    @GetMapping("/pageviews")
    public ResponseEntity<?> getPageviews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long postId) {

        List<PageviewLog> logs = pageviewLogRepository.findAll(Sort.by("viewedAt").descending());

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            logs = logs.stream().filter(l ->
                (l.getAuthorName() != null && l.getAuthorName().toLowerCase().contains(q)) ||
                (l.getArticleSlug() != null && l.getArticleSlug().toLowerCase().contains(q)) ||
                (l.getIpAddress() != null && l.getIpAddress().toLowerCase().contains(q)) ||
                (l.getUserAgent() != null && l.getUserAgent().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        if (authorId != null) {
            logs = logs.stream().filter(l -> Objects.equals(l.getAuthorId(), authorId)).collect(Collectors.toList());
        }

        if (postId != null) {
            logs = logs.stream().filter(l -> Objects.equals(l.getArticleId(), postId)).collect(Collectors.toList());
        }

        return ResponseEntity.ok(logs);
    }
}
