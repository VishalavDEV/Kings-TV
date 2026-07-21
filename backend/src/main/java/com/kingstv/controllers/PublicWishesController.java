package com.kingstv.controllers;

import com.kingstv.models.Wish;
import com.kingstv.repository.WishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/public/wishes", "/api/v1/public/wishes"})
public class PublicWishesController {

    @Autowired
    private WishRepository wishRepository;

    @GetMapping
    public ResponseEntity<List<Wish>> getPublishedWishes() {
        List<Wish> all = wishRepository.findAll();
        List<Wish> published = new ArrayList<>();
        for (Wish w : all) {
            if ("published".equalsIgnoreCase(w.getStatus()) && !Boolean.TRUE.equals(w.getDeleted())) {
                published.add(w);
            }
        }
        return ResponseEntity.ok(published);
    }

    @PostMapping
    public ResponseEntity<?> submitWish(@RequestBody Wish wish) {
        if (wish.getRecipientName() == null || wish.getRecipientName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Recipient Name is required"));
        }
        wish.setCreatedAt(LocalDateTime.now());
        wish.setUpdatedAt(LocalDateTime.now());
        // default status is pending until approved by an admin
        wish.setStatus("pending");
        Wish saved = wishRepository.save(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
