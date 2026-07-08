package com.kingstv.controllers;

import com.kingstv.models.Wish;
import com.kingstv.repository.WishRepository;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/wishes")
public class WishController {

    @Autowired
    private WishRepository wishRepository;

    // --- KEEP Existing Front-End Endpoint Map ---
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
        if (wish.getCreatedAt() == null) {
            wish.setCreatedAt(LocalDateTime.now());
        }
        Wish saved = wishRepository.save(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --- NEW Standardized API Standard Endpoints ---
    @GetMapping("/getAll")
    public Page<Wish> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Wish> spec = SpecificationBuilder.build(search, status, null, null);
        return wishRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<Wish> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "published", page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody Wish entity) {
        return createWish(entity);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody Wish entity) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<Wish> wishOpt = wishRepository.findById(entity.getId());
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        Wish wish = wishOpt.get();
        wish.setRecipientName(entity.getRecipientName());
        wish.setSenderName(entity.getSenderName());
        wish.setMessage(entity.getMessage());
        wish.setCategory(entity.getCategory());
        wish.setStatus(entity.getStatus());
        
        Wish updated = wishRepository.save(wish);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<Wish> opt = wishRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        Wish existing = opt.get();
        existing.setStatus(status);
        wishRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWish(@PathVariable Long id) {
        Optional<Wish> wishOpt = wishRepository.findById(id);
        if (wishOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Wish not found"));
        }
        Wish existing = wishOpt.get();
        existing.setStatus("deleted"); // Soft delete
        wishRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Wish soft-deleted successfully"));
    }
}
