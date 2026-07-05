package com.kingstv.controllers;

import com.kingstv.models.Wish;
import com.kingstv.repository.WishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishes")
public class WishController {

    @Autowired
    private WishRepository wishRepository;

    @GetMapping
    public List<Wish> getWishes() {
        return wishRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createWish(@RequestBody Wish wish) {
        if (wish.getRecipientName() == null || wish.getSenderName() == null || wish.getMessage() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        Wish saved = wishRepository.save(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
