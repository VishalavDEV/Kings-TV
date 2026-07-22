package com.kingstv.controllers.admin;

import com.kingstv.models.ClassifiedListing;
import com.kingstv.repository.ClassifiedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/classifieds", "/api/v1/admin/classifieds"})
public class AdminClassifiedsController {

    @Autowired
    private ClassifiedRepository classifiedRepository;

    @GetMapping
    public ResponseEntity<List<ClassifiedListing>> getAllClassifieds() {
        return ResponseEntity.ok(classifiedRepository.findAll());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveClassified(@PathVariable Long id) {
        Optional<ClassifiedListing> opt = classifiedRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing listing = opt.get();
        listing.setStatus("active");
        listing.setUpdatedAt(LocalDateTime.now());
        classifiedRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Classified listing approved and set to active successfully"));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspendClassified(@PathVariable Long id) {
        Optional<ClassifiedListing> opt = classifiedRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing listing = opt.get();
        listing.setStatus("suspended");
        listing.setUpdatedAt(LocalDateTime.now());
        classifiedRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Classified listing suspended successfully"));
    }

    @PutMapping("/{id}/recategorize")
    public ResponseEntity<?> recategorizeClassified(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<ClassifiedListing> opt = classifiedRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing listing = opt.get();
        if (payload.containsKey("categoryId") && payload.get("categoryId") != null) {
            listing.setCategoryId(Long.valueOf(payload.get("categoryId").toString()));
        }
        if (payload.containsKey("subcategoryId") && payload.get("subcategoryId") != null) {
            listing.setSubcategoryId(Long.valueOf(payload.get("subcategoryId").toString()));
        }
        if (payload.containsKey("category") && payload.get("category") != null) {
            listing.setCategory(payload.get("category").toString());
        }
        listing.setUpdatedAt(LocalDateTime.now());
        classifiedRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Classified listing recategorized successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassified(@PathVariable Long id) {
        Optional<ClassifiedListing> opt = classifiedRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        classifiedRepository.delete(opt.get());
        return ResponseEntity.ok(Map.of("message", "Classified listing deleted successfully"));
    }
}
