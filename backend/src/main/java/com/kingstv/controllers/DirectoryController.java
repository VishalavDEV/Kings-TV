package com.kingstv.controllers;

import com.kingstv.models.DirectoryListing;
import com.kingstv.repository.DirectoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/directory")
public class DirectoryController {

    @Autowired
    private DirectoryRepository directoryRepository;

    @GetMapping
    public List<DirectoryListing> getListings() {
        return directoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createListing(@RequestBody DirectoryListing listing) {
        if (listing.getBusinessName() == null || listing.getCategory() == null || listing.getPhoneNumber() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        DirectoryListing saved = directoryRepository.save(listing);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
