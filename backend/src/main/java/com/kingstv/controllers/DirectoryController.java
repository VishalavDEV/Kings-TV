package com.kingstv.controllers;

import com.kingstv.models.DirectoryListing;
import com.kingstv.repository.DirectoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/directory")
public class DirectoryController {

    @Autowired
    private DirectoryRepository directoryRepository;

    @GetMapping
    public List<DirectoryListing> getListings() {
        return directoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getListingById(@PathVariable Long id) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Directory listing not found"));
        }
        return ResponseEntity.ok(listingOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createListing(@RequestBody DirectoryListing listing) {
        if (listing.getBusinessName() == null || listing.getCategory() == null || listing.getPhoneNumber() == null || listing.getAddressLocality() == null || listing.getAddressStreet() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        DirectoryListing saved = directoryRepository.save(listing);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Long id, @RequestBody DirectoryListing listingDetails) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Directory listing not found"));
        }
        DirectoryListing listing = listingOpt.get();
        listing.setBusinessName(listingDetails.getBusinessName());
        listing.setCategory(listingDetails.getCategory());
        listing.setAddressLocality(listingDetails.getAddressLocality());
        listing.setAddressStreet(listingDetails.getAddressStreet());
        listing.setWorkingHours(listingDetails.getWorkingHours());
        listing.setPhoneNumber(listingDetails.getPhoneNumber());
        
        DirectoryListing updated = directoryRepository.save(listing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id) {
        Optional<DirectoryListing> listingOpt = directoryRepository.findById(id);
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Directory listing not found"));
        }
        directoryRepository.delete(listingOpt.get());
        return ResponseEntity.noContent().build();
    }
}
