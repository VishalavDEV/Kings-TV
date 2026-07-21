package com.kingstv.controllers.admin;

import com.kingstv.models.DirectoryListing;
import com.kingstv.models.DirectoryCategory;
import com.kingstv.repository.DirectoryRepository;
import com.kingstv.repository.DirectoryCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/business-listings", "/api/v1/admin/business-listings"})
public class AdminBusinessListingController {

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

    // --- Listings CRUD ---
    @GetMapping
    public ResponseEntity<List<DirectoryListing>> getAllListings() {
        return ResponseEntity.ok(directoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createListing(@RequestBody DirectoryListing listing) {
        if (listing.getBusinessName() == null || listing.getBusinessName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Business name is required"));
        }
        if (listing.getCategory() == null || listing.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
        }
        if (listing.getSlug() == null || listing.getSlug().trim().isEmpty()) {
            listing.setSlug(makeSlug(listing.getBusinessName()) + "-" + (int)(Math.random() * 10000));
        }
        listing.setCreatedAt(LocalDateTime.now());
        listing.setUpdatedAt(LocalDateTime.now());
        DirectoryListing saved = directoryRepository.save(listing);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Long id, @RequestBody DirectoryListing entity) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        listing.setBusinessName(entity.getBusinessName());
        listing.setName(entity.getName());
        listing.setCategory(entity.getCategory());
        listing.setCategoryId(entity.getCategoryId());
        listing.setSubcategory(entity.getSubcategory());
        listing.setAddress(entity.getAddress());
        listing.setAddressLocality(entity.getAddressLocality());
        listing.setAddressStreet(entity.getAddressStreet());
        listing.setWorkingHours(entity.getWorkingHours());
        listing.setHoursJson(entity.getHoursJson());
        listing.setPhoneNumber(entity.getPhoneNumber());
        listing.setPhone(entity.getPhone());
        listing.setEmail(entity.getEmail());
        listing.setWebsite(entity.getWebsite());
        listing.setLogoUrl(entity.getLogoUrl());
        listing.setLogo(entity.getLogo());
        listing.setCoverUrl(entity.getCoverUrl());
        listing.setCoverImage(entity.getCoverImage());
        listing.setDescription(entity.getDescription());
        listing.setLatitude(entity.getLatitude());
        listing.setLongitude(entity.getLongitude());
        listing.setIsVerified(entity.getIsVerified());
        listing.setStatus(entity.getStatus());
        listing.setUpdatedAt(LocalDateTime.now());

        if (entity.getSlug() != null && !entity.getSlug().trim().isEmpty()) {
            listing.setSlug(entity.getSlug());
        }

        DirectoryListing updated = directoryRepository.save(listing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        directoryRepository.delete(listingOpt.get());
        return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
    }

    // --- Moderation Actions ---
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveListing(@PathVariable Long id) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        listing.setStatus("approved");
        listing.setUpdatedAt(LocalDateTime.now());
        directoryRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Listing approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectListing(@PathVariable Long id) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        listing.setStatus("rejected");
        listing.setUpdatedAt(LocalDateTime.now());
        directoryRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Listing rejected successfully"));
    }

    // --- Categories CRUD ---
    @GetMapping("/categories")
    public ResponseEntity<List<DirectoryCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody DirectoryCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
        }
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(makeSlug(category.getName()));
        }
        DirectoryCategory saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody DirectoryCategory entity) {
        Optional<DirectoryCategory> catOpt = categoryRepository.findById(id);
        if (catOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Category not found"));
        }
        DirectoryCategory category = catOpt.get();
        category.setName(entity.getName());
        category.setIcon(entity.getIcon());
        if (entity.getSlug() != null && !entity.getSlug().trim().isEmpty()) {
            category.setSlug(entity.getSlug());
        }
        DirectoryCategory updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        Optional<DirectoryCategory> catOpt = categoryRepository.findById(id);
        if (catOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Category not found"));
        }
        categoryRepository.delete(catOpt.get());
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
