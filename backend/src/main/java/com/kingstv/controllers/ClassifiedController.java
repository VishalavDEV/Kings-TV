package com.kingstv.controllers;

import com.kingstv.models.ClassifiedListing;
import com.kingstv.repository.ClassifiedRepository;
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
@RequestMapping("/api/v1/classifieds")
public class ClassifiedController {

    @Autowired
    private ClassifiedRepository classifiedRepository;

    // --- KEEP Existing Front-End Endpoint Map ---
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
        if (classified.getCreatedAt() == null) {
            classified.setCreatedAt(LocalDateTime.now());
        }
        ClassifiedListing saved = classifiedRepository.save(classified);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --- NEW Standardized API Standard Endpoints ---
    @GetMapping("/getAll")
    public Page<ClassifiedListing> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<ClassifiedListing> spec = SpecificationBuilder.build(search, status, null, null);
        return classifiedRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<ClassifiedListing> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "active", page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody ClassifiedListing entity) {
        return createClassified(entity);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody ClassifiedListing entity) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<ClassifiedListing> adOpt = classifiedRepository.findById(entity.getId());
        if (adOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing classified = adOpt.get();
        classified.setTitle(entity.getTitle());
        classified.setCategory(entity.getCategory());
        classified.setPriceDetail(entity.getPriceDetail());
        classified.setLocation(entity.getLocation());
        classified.setContactInfo(entity.getContactInfo());
        classified.setDescription(entity.getDescription());
        classified.setStatus(entity.getStatus());
        
        ClassifiedListing updated = classifiedRepository.save(classified);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<ClassifiedListing> opt = classifiedRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing existing = opt.get();
        existing.setStatus(status);
        classifiedRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassified(@PathVariable Long id) {
        Optional<ClassifiedListing> adOpt = classifiedRepository.findById(id);
        if (adOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Classified listing not found"));
        }
        ClassifiedListing existing = adOpt.get();
        existing.setStatus("deleted"); // Soft delete
        classifiedRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Classified soft-deleted successfully"));
    }
}
