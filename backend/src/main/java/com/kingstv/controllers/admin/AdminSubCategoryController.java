package com.kingstv.controllers.admin;

import com.kingstv.models.SubCategory;
import com.kingstv.repository.SubCategoryRepository;
import com.kingstv.services.SlugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/subcategories")
public class AdminSubCategoryController {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private SlugService slugService;

    @GetMapping
    public ResponseEntity<List<SubCategory>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubCategoryById(@PathVariable Long id) {
        Optional<SubCategory> subCategory = subCategoryRepository.findById(id);
        if (subCategory.isPresent()) {
            return ResponseEntity.ok(subCategory.get());
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Subcategory not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @PostMapping
    public ResponseEntity<?> createSubCategory(@RequestBody SubCategory subCategory) {
        if (subCategory.getName() == null || subCategory.getName().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Subcategory name is required");
            return ResponseEntity.badRequest().body(err);
        }

        Long parentId = subCategory.getParentCategoryId();
        if (parentId == null) {
            parentId = subCategory.getCategoryId();
        }
        if (parentId == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Parent Category ID is required");
            return ResponseEntity.badRequest().body(err);
        }
        subCategory.setParentCategoryId(parentId);

        String lang = (subCategory.getLanguage() != null && !subCategory.getLanguage().trim().isEmpty())
                ? subCategory.getLanguage().trim() : "ta";
        subCategory.setLanguage(lang);

        String name = subCategory.getName().trim();
        subCategory.setName(name);

        // Reject duplicate name + language under same parent category
        if (subCategoryRepository.existsByNameAndLanguageAndCategoryId(name, lang, parentId)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Subcategory with name '" + name + "' already exists under this parent category");
            return ResponseEntity.badRequest().body(err);
        }

        // Handle slug
        slugService.generateAndSetSlug(subCategory);

        SubCategory saved = subCategoryRepository.save(subCategory);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubCategory(@PathVariable Long id, @RequestBody SubCategory updatedSubCategory) {
        Optional<SubCategory> existingOpt = subCategoryRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Subcategory not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        SubCategory existing = existingOpt.get();

        Long parentId = updatedSubCategory.getParentCategoryId() != null ? updatedSubCategory.getParentCategoryId() : existing.getParentCategoryId();
        String lang = updatedSubCategory.getLanguage() != null ? updatedSubCategory.getLanguage() : existing.getLanguage();

        if (updatedSubCategory.getName() != null && !updatedSubCategory.getName().trim().isEmpty()) {
            String name = updatedSubCategory.getName().trim();
            if (subCategoryRepository.existsByNameAndLanguageAndCategoryIdAndSubcategoryIdNot(name, lang, parentId, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Subcategory with name '" + name + "' already exists under this parent category");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setName(name);
        }

        existing.setParentCategoryId(parentId);
        existing.setLanguage(lang);

        if (updatedSubCategory.getSlug() != null && !updatedSubCategory.getSlug().trim().isEmpty()) {
            String slug = updatedSubCategory.getSlug().trim();
            if (subCategoryRepository.existsBySlugAndSubcategoryIdNot(slug, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setSlug(slug);
        }

        if (updatedSubCategory.getDescription() != null) existing.setDescription(updatedSubCategory.getDescription());
        if (updatedSubCategory.getKeywords() != null) existing.setKeywords(updatedSubCategory.getKeywords());
        if (updatedSubCategory.getColor() != null) existing.setColor(updatedSubCategory.getColor());
        if (updatedSubCategory.getMenuOrder() != null) existing.setMenuOrder(updatedSubCategory.getMenuOrder());
        if (updatedSubCategory.getShowOnMenu() != null) existing.setShowOnMenu(updatedSubCategory.getShowOnMenu());
        if (updatedSubCategory.getStatus() != null) existing.setStatus(updatedSubCategory.getStatus());

        SubCategory saved = subCategoryRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubCategory(@PathVariable Long id) {
        if (!subCategoryRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Subcategory not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        subCategoryRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Subcategory deleted successfully");
        return ResponseEntity.ok(res);
    }
}
