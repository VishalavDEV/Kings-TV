package com.kingstv.controllers.admin;

import com.kingstv.models.Wish;
import com.kingstv.repository.WishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/wishes", "/api/v1/admin/wishes"})
public class AdminWishesController {

    @Autowired
    private WishRepository wishRepository;

    @GetMapping
    public ResponseEntity<List<Wish>> getAllWishes() {
        return ResponseEntity.ok(wishRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createWish(@RequestBody Wish wish) {
        if (wish.getRecipientName() == null || wish.getRecipientName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Recipient Name is required"));
        }
        wish.setCreatedAt(LocalDateTime.now());
        wish.setUpdatedAt(LocalDateTime.now());
        if (wish.getStatus() == null) {
            wish.setStatus("published");
        }
        Wish saved = wishRepository.save(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWish(@PathVariable Long id, @RequestBody Wish entity) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        
        Wish wish = wishOpt.get();
        wish.setRecipientName(entity.getRecipientName());
        wish.setRecipientPhoto(entity.getRecipientPhoto());
        wish.setWishType(entity.getWishType());
        wish.setSenderName(entity.getSenderName());
        wish.setSenderProfile(entity.getSenderProfile());
        wish.setRelationship(entity.getRelationship());
        wish.setMessage(entity.getMessage());
        wish.setStatus(entity.getStatus());
        wish.setScheduledPublishAt(entity.getScheduledPublishAt());
        wish.setUpdatedAt(LocalDateTime.now());

        Wish updated = wishRepository.save(wish);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWish(@PathVariable Long id) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        wishRepository.delete(wishOpt.get());
        return ResponseEntity.ok(Map.of("message", "Wish deleted successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveWish(@PathVariable Long id) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        Wish wish = wishOpt.get();
        wish.setStatus("published");
        wish.setUpdatedAt(LocalDateTime.now());
        wishRepository.save(wish);
        return ResponseEntity.ok(Map.of("message", "Wish approved and published successfully"));
    }
}
