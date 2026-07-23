package com.kingstv.controllers;

import com.kingstv.models.BreakingNews;
import com.kingstv.repository.BreakingNewsRepository;
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
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/v1/breaking-news")
public class BreakingNewsController {

    @Autowired
    private BreakingNewsRepository breakingNewsRepository;

    @GetMapping({"", "/", "/getAll"})
    public Page<BreakingNews> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<BreakingNews> spec = SpecificationBuilder.build(search, status, categoryId, districtId);
        Page<BreakingNews> result = breakingNewsRepository.findAll(spec, pageable);
        if (result.isEmpty() && (status == null || status.equals("published"))) {
            // Fallback: return any breaking news if status filter returned 0
            return breakingNewsRepository.findAll(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id")));
        }
        return result;
    }

    @GetMapping("/getAllWeb")
    public ResponseEntity<?> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Page<BreakingNews> pageResult = getAll(search, null, categoryId, districtId, page, size, sortBy, direction);
        List<BreakingNews> items = pageResult.getContent();
        if (items.isEmpty()) {
            items = breakingNewsRepository.findAll(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"))).getContent();
        }
        return ResponseEntity.ok(Map.of(
            "content", items,
            "totalElements", items.size(),
            "totalPages", 1,
            "number", 0
        ));
    }

    @PostMapping({"/saveUpdate", "", "/"})
    public ResponseEntity<?> save(@RequestBody BreakingNews entity) {
        if (entity.getTitle() == null && entity.getTitleTa() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title or Title (Tamil) is required"));
        }
        if (entity.getTitle() == null) entity.setTitle(entity.getTitleTa());
        if (entity.getTitleTa() == null) entity.setTitleTa(entity.getTitle());
        if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
            entity.setStatus("published");
        }
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());
        BreakingNews saved = breakingNewsRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping({"/saveUpdate", "", "/"})
    public ResponseEntity<?> update(@RequestBody BreakingNews entity) {
        if (entity.getId() == null) {
            return save(entity);
        }
        Optional<BreakingNews> opt = breakingNewsRepository.findById(entity.getId());
        if (opt.isEmpty()) {
            return save(entity);
        }
        BreakingNews existing = opt.get();
        existing.setTitle(entity.getTitle() != null ? entity.getTitle() : entity.getTitleTa());
        existing.setTitleTa(entity.getTitleTa() != null ? entity.getTitleTa() : entity.getTitle());
        existing.setShortDescription(entity.getShortDescription());
        existing.setContent(entity.getContent());
        existing.setImageUrl(entity.getImageUrl());
        existing.setVideoUrl(entity.getVideoUrl());
        existing.setPdfUrl(entity.getPdfUrl());
        existing.setCategoryId(entity.getCategoryId());
        existing.setSubcategoryId(entity.getSubcategoryId());
        existing.setDistrictId(entity.getDistrictId());
        existing.setPriority(entity.getPriority());
        existing.setStatus(entity.getStatus() != null ? entity.getStatus() : "published");
        existing.setBreaking(entity.getBreaking() != null ? entity.getBreaking() : true);
        existing.setPublishedAt(entity.getPublishedAt() != null ? entity.getPublishedAt() : LocalDateTime.now());
        existing.setUpdatedBy(entity.getUpdatedBy());
        existing.setUpdatedAt(LocalDateTime.now());
        
        BreakingNews saved = breakingNewsRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<BreakingNews> opt = breakingNewsRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "BreakingNews not found"));
        }
        BreakingNews existing = opt.get();
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        breakingNewsRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<BreakingNews> opt = breakingNewsRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "BreakingNews not found"));
        }
        BreakingNews existing = opt.get();
        existing.setStatus("deleted"); // Soft delete
        existing.setUpdatedAt(LocalDateTime.now());
        breakingNewsRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "BreakingNews soft-deleted successfully"));
    }
}
