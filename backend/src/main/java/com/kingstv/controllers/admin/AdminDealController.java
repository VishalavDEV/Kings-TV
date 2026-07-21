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

    @GetMapping
    public ResponseEntity<List<Deal>> getAllDeals() {
        return ResponseEntity.ok(dealRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createDeal(@RequestBody Deal deal) {
        if (deal.getTitle() == null || deal.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Deal title is required"));
        }
        if (deal.getDiscountType() == null || deal.getDiscountType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Discount type is required"));
        }
        if (deal.getDiscountValue() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Discount value is required"));
        }

        deal.setCreatedAt(LocalDateTime.now());
        deal.setUpdatedAt(LocalDateTime.now());
        if (deal.getValidFrom() == null) {
            deal.setValidFrom(LocalDateTime.now());
        }
        if (deal.getValidUntil() == null) {
            deal.setValidUntil(LocalDateTime.now().plusDays(30)); // default 30 days
        }
        if (deal.getCategory() == null) {
            deal.setCategory("General");
        }
        Deal saved = dealRepository.save(deal);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeal(@PathVariable Long id, @RequestBody Deal entity) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        Deal deal = dealOpt.get();
        deal.setTitle(entity.getTitle());
        deal.setListingId(entity.getListingId());
        deal.setBusinessId(entity.getBusinessId());
        deal.setDiscountType(entity.getDiscountType());
        deal.setDiscountValue(entity.getDiscountValue());
        deal.setCategory(entity.getCategory() != null ? entity.getCategory() : "General");
        deal.setTerms(entity.getTerms());
        deal.setTermsConditions(entity.getTermsConditions());
        deal.setBannerUrl(entity.getBannerUrl() != null ? entity.getBannerUrl() : entity.getImage());
        deal.setImage(entity.getImage());
        deal.setValidFrom(entity.getValidFrom());
        deal.setValidUntil(entity.getValidUntil());
        deal.setStatus(entity.getStatus());
        deal.setUpdatedAt(LocalDateTime.now());

        Deal updated = dealRepository.save(deal);
        return ResponseEntity.ok(updated);
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
    public ResponseEntity<?> rejectDeal(@PathVariable Long id) {
        Optional<Deal> dealOpt = dealRepository.findById(id);
        if (dealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Deal not found"));
        }
        Deal deal = dealOpt.get();
        deal.setStatus("rejected");
        deal.setUpdatedAt(LocalDateTime.now());
        dealRepository.save(deal);
        return ResponseEntity.ok(Map.of("message", "Deal rejected successfully"));
    }
}
