package com.kingstv.controllers;

import com.kingstv.models.DirectoryListing;
import com.kingstv.models.DirectoryCategory;
import com.kingstv.repository.DirectoryRepository;
import com.kingstv.repository.DirectoryCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/public/directory", "/api/v1/public/directory"})
public class PublicDirectoryController {

    @Autowired
    private DirectoryRepository directoryRepository;

    @Autowired
    private DirectoryCategoryRepository categoryRepository;

    private String makeSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "business-" + System.currentTimeMillis();
        }
        String slug = input.replaceAll("[^a-zA-Z0-9\\u0B80-\\u0BFF\\s\\-]", "")
                .trim().replaceAll("\\s+", "-").replaceAll("-+", "-").toLowerCase();
        if (slug.isEmpty()) {
            slug = "business-" + System.currentTimeMillis();
        }
        return slug;
    }

    @GetMapping
    public ResponseEntity<?> getPublicDirectory(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {

        Specification<DirectoryListing> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Only show approved/active status
            predicates.add(cb.equal(root.get("status"), "approved"));

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.or(
                    cb.equal(root.get("category"), category),
                    cb.equal(root.get("subcategory"), category)
                ));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("address")), "%" + location.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("addressLocality")), "%" + location.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("addressStreet")), "%" + location.toLowerCase() + "%")
                ));
            }

            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("businessName")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<DirectoryListing> results = directoryRepository.findAll(spec);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/detail/{slug}")
    public ResponseEntity<?> getPublicListingDetail(@PathVariable String slug) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findBySlug(slug);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Business listing not found"));
        }
        return ResponseEntity.ok(listingOpt.get());
    }

    @PostMapping("/submit")
    public ResponseEntity<?> selfSubmitListing(@RequestBody DirectoryListing listing) {
        if (listing.getBusinessName() == null || listing.getBusinessName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Business name is required"));
        }
        if (listing.getCategory() == null || listing.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
        }
        
        listing.setStatus("pending");
        listing.setIsVerified(false);
        if (listing.getSlug() == null || listing.getSlug().trim().isEmpty()) {
            listing.setSlug(makeSlug(listing.getBusinessName()) + "-" + (int)(Math.random() * 10000));
        }
        listing.setCreatedAt(LocalDateTime.now());
        listing.setUpdatedAt(LocalDateTime.now());
        
        DirectoryListing saved = directoryRepository.save(listing);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<DirectoryCategory>> getPublicCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}
