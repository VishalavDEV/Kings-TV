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

import com.kingstv.models.BusinessReview;
import com.kingstv.repository.BusinessReviewRepository;

@RestController
@RequestMapping({"/api/admin/business-listings", "/api/v1/admin/business-listings"})
public class AdminBusinessListingController {

    @Autowired
    private DirectoryRepository directoryRepository;

    @Autowired
    private DirectoryCategoryRepository categoryRepository;

    @Autowired
    private BusinessReviewRepository reviewRepository;

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
    public ResponseEntity<?> rejectListing(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        String reason = request.get("reason");
        listing.setStatus("rejected");
        listing.setRejectionReason(reason);
        listing.setUpdatedAt(LocalDateTime.now());
        directoryRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Listing rejected successfully"));
    }

    @PutMapping("/{id}/more-info")
    public ResponseEntity<?> requestMoreInfo(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        String note = request.get("note");
        listing.setStatus("pending");
        listing.setMoreInfoNote(note);
        listing.setUpdatedAt(LocalDateTime.now());
        directoryRepository.save(listing);
        return ResponseEntity.ok(Map.of("message", "Request for more information sent successfully"));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        Optional<BusinessReview> revOpt = reviewRepository.findById(reviewId);
        if (revOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Review not found"));
        }
        BusinessReview review = revOpt.get();
        reviewRepository.delete(review);
        
        // Recalculate listing rating avg and count
        Long listingId = review.getListingId();
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(listingId);
        if (listingOpt.isPresent()) {
            DirectoryListing listing = listingOpt.get();
            List<BusinessReview> reviews = reviewRepository.findByListingIdAndStatus(listingId, "approved");
            double sum = 0.0;
            for (BusinessReview r : reviews) {
                sum += r.getRating();
            }
            double avg = reviews.isEmpty() ? 0.0 : sum / reviews.size();
            listing.setRatingAvg(avg);
            listing.setRatingCount(reviews.size());
            directoryRepository.save(listing);
        }
        return ResponseEntity.ok(Map.of("message", "Review deleted and rating recalculated"));
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
