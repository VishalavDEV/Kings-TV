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

    @Autowired
    private com.kingstv.repository.WishFrameTemplateRepository wishTemplateRepository;

    @Autowired
    private com.kingstv.repository.WishCommentRepository wishCommentRepository;

    @GetMapping
    public ResponseEntity<List<Wish>> getAllWishes() {
        return ResponseEntity.ok(wishRepository.findAll());
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

    // --- Templates CRUD ---
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        return ResponseEntity.ok(wishTemplateRepository.findAll());
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createTemplate(@RequestBody com.kingstv.models.WishFrameTemplate template) {
        if (template.getName() == null || template.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Template name is required"));
        }
        if (template.getSlug() == null || template.getSlug().trim().isEmpty()) {
            template.setSlug("wish-template-" + System.currentTimeMillis());
        }
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());
        com.kingstv.models.WishFrameTemplate saved = wishTemplateRepository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        Optional<com.kingstv.models.WishFrameTemplate> opt = wishTemplateRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Template not found"));
        }
        wishTemplateRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
    }

    // --- Comments Moderation ---
    @GetMapping("/comments")
    public ResponseEntity<?> getComments() {
        return ResponseEntity.ok(wishCommentRepository.findAll());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Optional<com.kingstv.models.WishComment> opt = wishCommentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Comment not found"));
        }
        wishCommentRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }
}
