package com.kingstv.controllers.admin;

import com.kingstv.models.Deal;
import com.kingstv.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/deals", "/api/v1/admin/deals"})
public class AdminDealController {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private com.kingstv.repository.DealRedemptionRepository redemptionRepository;

    @GetMapping
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(dealRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeal(@PathVariable Long id) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        dealRepository.delete(dealOpt.get());
        return ResponseEntity.ok(Map.of("message", "Deal deleted successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveDeal(@PathVariable Long id) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        Deal deal = dealOpt.get();
        deal.setStatus("approved");
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return ResponseEntity.ok(Map.of("message", "Deal approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectDeal(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        Deal deal = dealOpt.get();
        String reason = request.get("reason");
        deal.setStatus("rejected");
        deal.setRejectionReason(reason);
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return ResponseEntity.ok(Map.of("message", "Deal rejected successfully"));
    }

    @PutMapping("/{id}/more-info")
    public ResponseEntity<?> requestMoreInfo(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        Deal deal = dealOpt.get();
        String note = request.get("note");
        deal.setStatus("pending");
        deal.setMoreInfoNote(note);
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return ResponseEntity.ok(Map.of("message", "Request for more information sent successfully"));
    }

    @GetMapping("/redemptions")
    public ResponseEntity<?> getRedemptions() {
        return ResponseEntity.ok(redemptionRepository.findAll());
    }
}
