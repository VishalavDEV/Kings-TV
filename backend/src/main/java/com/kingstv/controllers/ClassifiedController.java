package com.kingstv.controllers;

import com.kingstv.models.ClassifiedListing;
import com.kingstv.repository.ClassifiedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/classifieds")
public class ClassifiedController {

    @Autowired
    private ClassifiedRepository classifiedRepository;

    @GetMapping
    public List<ClassifiedListing> getClassifieds() {
        return classifiedRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClassifiedById(@PathVariable Long id) {
        Optional<ClassifiedListing> adOpt = classifiedRepository.findById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        return ResponseEntity.ok(adOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createClassified(@RequestBody ClassifiedListing classified) {
        if (classified.getTitle() == null || classified.getCategory() == null || classified.getPriceDetail() == null || classified.getLocation() == null || classified.getContactInfo() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        ClassifiedListing saved = classifiedRepository.save(classified);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClassified(@PathVariable Long id, @RequestBody ClassifiedListing adDetails) {
        Optional<ClassifiedListing> adOpt = classifiedRepository.findById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing classified = adOpt.get();
        classified.setTitle(adDetails.getTitle());
        classified.setCategory(adDetails.getCategory());
        classified.setPriceDetail(adDetails.getPriceDetail());
        classified.setLocation(adDetails.getLocation());
        classified.setContactInfo(adDetails.getContactInfo());
        classified.setDescription(adDetails.getDescription());
        
        ClassifiedListing updated = classifiedRepository.save(classified);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassified(@PathVariable Long id) {
        Optional<ClassifiedListing> adOpt = classifiedRepository.findById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        classifiedRepository.delete(adOpt.get());
        return ResponseEntity.noContent().build();
    }
}
