package com.kingstv.controllers;

import com.kingstv.models.Advertisement;
import com.kingstv.repository.AdvertisementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import com.kingstv.repository.SpecificationBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/advertisements")
public class AdvertisementController {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @GetMapping("/getAll")
    public Page<Advertisement> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Advertisement> spec = SpecificationBuilder.build(search, status, null, null);
        return advertisementRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<Advertisement> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "active", page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody Advertisement entity) {
        if (entity.getTitle() == null || entity.getImageUrl() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and Image URL are required"));
        }
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());
        Advertisement saved = advertisementRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody Advertisement entity) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<Advertisement> opt = advertisementRepository.findById(entity.getId());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Advertisement not found"));
        }
        Advertisement existing = opt.get();
        existing.setTitle(entity.getTitle());
        existing.setImageUrl(entity.getImageUrl());
        existing.setLinkUrl(entity.getLinkUrl());
        existing.setStatus(entity.getStatus());
        existing.setStartDate(entity.getStartDate());
        existing.setEndDate(entity.getEndDate());
        existing.setPlacement(entity.getPlacement());
        existing.setTargetDevice(entity.getTargetDevice());
        existing.setTargetGeo(entity.getTargetGeo());
        existing.setRemainingBudget(entity.getRemainingBudget());
        existing.setCostPerClick(entity.getCostPerClick());
        existing.setCostPerImpression(entity.getCostPerImpression());
        existing.setUpdatedAt(LocalDateTime.now());
        
        Advertisement saved = advertisementRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAds(
            @RequestParam String placement,
            @RequestParam(defaultValue = "all") String device,
            @RequestParam(defaultValue = "all") String geo) {
        
        java.util.List<Advertisement> allAds = advertisementRepository.findAll();
        java.util.List<Advertisement> filtered = allAds.stream()
            .filter(ad -> "active".equals(ad.getStatus()))
            .filter(ad -> placement.equalsIgnoreCase(ad.getPlacement()))
            .filter(ad -> "all".equalsIgnoreCase(ad.getTargetDevice()) || device.equalsIgnoreCase(ad.getTargetDevice()))
            .filter(ad -> "all".equalsIgnoreCase(ad.getTargetGeo()) || geo.equalsIgnoreCase(ad.getTargetGeo()))
            .filter(ad -> ad.getRemainingBudget() != null && ad.getRemainingBudget() > 0)
            .collect(java.util.stream.Collectors.toList());

        // Rotate ads by shuffling them randomly so that all active campaigns get exposure
        java.util.Collections.shuffle(filtered);
        
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/{id}/impression")
    public ResponseEntity<?> recordImpression(@PathVariable Long id) {
        Optional<Advertisement> opt = advertisementRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Advertisement ad = opt.get();
        ad.setImpressionCount((ad.getImpressionCount() != null ? ad.getImpressionCount() : 0) + 1);
        
        double cost = ad.getCostPerImpression() != null ? ad.getCostPerImpression() : 0.005;
        double budget = ad.getRemainingBudget() != null ? ad.getRemainingBudget() : 0.0;
        double newBudget = Math.max(0.0, budget - cost);
        ad.setRemainingBudget(newBudget);
        
        if (newBudget <= 0.0) {
            ad.setStatus("inactive");
        }
        
        advertisementRepository.save(ad);
        return ResponseEntity.ok(Map.of("message", "Impression recorded", "remainingBudget", newBudget));
    }

    @PostMapping("/{id}/click")
    public ResponseEntity<?> recordClick(@PathVariable Long id) {
        Optional<Advertisement> opt = advertisementRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        Advertisement ad = opt.get();
        ad.setClickCount((ad.getClickCount() != null ? ad.getClickCount() : 0) + 1);
        
        double cost = ad.getCostPerClick() != null ? ad.getCostPerClick() : 0.10;
        double budget = ad.getRemainingBudget() != null ? ad.getRemainingBudget() : 0.0;
        double newBudget = Math.max(0.0, budget - cost);
        ad.setRemainingBudget(newBudget);
        
        if (newBudget <= 0.0) {
            ad.setStatus("inactive");
        }
        
        advertisementRepository.save(ad);
        return ResponseEntity.ok(Map.of("message", "Click recorded", "remainingBudget", newBudget));
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<Advertisement> opt = advertisementRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Advertisement not found"));
        }
        Advertisement existing = opt.get();
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        advertisementRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Advertisement> opt = advertisementRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Advertisement not found"));
        }
        Advertisement existing = opt.get();
        existing.setStatus("deleted"); // Soft delete
        existing.setUpdatedAt(LocalDateTime.now());
        advertisementRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Advertisement soft-deleted successfully"));
    }
}
