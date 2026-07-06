package com.kingstv.controllers;

import com.kingstv.models.Wish;
import com.kingstv.repository.WishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/wishes")
public class WishController {

    @Autowired
    private WishRepository wishRepository;

    @GetMapping
    public List<Wish> getWishes() {
        return wishRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWishById(@PathVariable Long id) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        return ResponseEntity.ok(wishOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createWish(@RequestBody Wish wish) {
        if (wish.getRecipientName() == null || wish.getSenderName() == null || wish.getMessage() == null || wish.getCategory() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        Wish saved = wishRepository.save(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWish(@PathVariable Long id, @RequestBody Wish wishDetails) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        Wish wish = wishOpt.get();
        wish.setRecipientName(wishDetails.getRecipientName());
        wish.setSenderName(wishDetails.getSenderName());
        wish.setMessage(wishDetails.getMessage());
        wish.setCategory(wishDetails.getCategory());
        
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
        return ResponseEntity.noContent().build();
    }
}
