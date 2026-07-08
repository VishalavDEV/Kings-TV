package com.kingstv.controllers;

import com.kingstv.models.Obituary;
import com.kingstv.repository.ObituaryRepository;
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
@RequestMapping("/api/v1/obituaries")
public class ObituaryController {

    @Autowired
    private ObituaryRepository obituaryRepository;

    // --- KEEP Existing Front-End Endpoint Map ---
    @GetMapping
    public List<Obituary> getObituaries() {
        return obituaryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getObituaryById(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        return ResponseEntity.ok(obitOpt.get());
    }

    @PostMapping
    public ResponseEntity<?> createObituary(@RequestBody Obituary obituary) {
        if (obituary.getDeceasedName() == null || obituary.getAge() == null || obituary.getLocation() == null || obituary.getDemiseDate() == null || obituary.getFuneralDetails() == null || obituary.getShortDescription() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields are missing"));
        }
        if (obituary.getCreatedAt() == null) {
            obituary.setCreatedAt(LocalDateTime.now());
        }
        Obituary saved = obituaryRepository.save(obituary);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/tribute")
    public ResponseEntity<?> payTribute(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary obituary = obitOpt.get();
        obituary.setTributeCount(obituary.getTributeCount() + 1);
        Obituary saved = obituaryRepository.save(obituary);
        return ResponseEntity.ok(saved);
    }

    // --- NEW Standardized API Standard Endpoints ---
    @GetMapping("/getAll")
    public Page<Obituary> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Obituary> spec = SpecificationBuilder.build(search, status, null, null);
        return obituaryRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<Obituary> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "published", page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody Obituary entity) {
        return createObituary(entity);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody Obituary entity) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<Obituary> obitOpt = obituaryRepository.findById(entity.getId());
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary obituary = obitOpt.get();
        obituary.setDeceasedName(entity.getDeceasedName());
        obituary.setAge(entity.getAge());
        obituary.setLocation(entity.getLocation());
        obituary.setDemiseDate(entity.getDemiseDate());
        obituary.setFuneralDetails(entity.getFuneralDetails());
        obituary.setShortDescription(entity.getShortDescription());
        obituary.setStatus(entity.getStatus());
        
        Obituary updated = obituaryRepository.save(obituary);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<Obituary> opt = obituaryRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary existing = opt.get();
        existing.setStatus(status);
        obituaryRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteObituary(@PathVariable Long id) {
        Optional<Obituary> obitOpt = obituaryRepository.findById(id);
        if (obitOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Obituary not found"));
        }
        Obituary existing = obitOpt.get();
        existing.setStatus("deleted"); // Soft delete
        obituaryRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Obituary soft-deleted successfully"));
    }
}
