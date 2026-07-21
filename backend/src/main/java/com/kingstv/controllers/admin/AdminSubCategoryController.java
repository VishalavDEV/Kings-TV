package com.kingstv.controllers.admin;

import com.kingstv.models.SubCategory;
import com.kingstv.repository.SubCategoryRepository;
import com.kingstv.repository.ArticleRepository;
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
    private ArticleRepository articleRepository;

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
        if (subCategory.getName() == null || subCategory.getName().trim().length() < 2 || subCategory.getName().trim().length() > 100) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Subcategory name must be between 2 and 100 characters");
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

        // Validate hex color if provided
        if (subCategory.getColor() != null && !subCategory.getColor().trim().isEmpty()) {
            String hexColor = subCategory.getColor().trim();
            if (!hexColor.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Color must be a valid hex code (e.g. #3B82F6)");
                return ResponseEntity.badRequest().body(err);
            }
            subCategory.setColor(hexColor);
        }

        // Handle slug
        if (subCategory.getSlug() != null && !subCategory.getSlug().trim().isEmpty()) {
            String slug = subCategory.getSlug().trim();
            if (subCategoryRepository.existsBySlugAndLanguage(slug, lang)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }
            subCategory.setSlug(slug);
        } else {
            slugService.generateAndSetSlug(subCategory);
        }

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

        String name = existing.getName();
        if (updatedSubCategory.getName() != null && !updatedSubCategory.getName().trim().isEmpty()) {
            name = updatedSubCategory.getName().trim();
            if (name.length() < 2 || name.length() > 100) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Subcategory name must be between 2 and 100 characters");
                return ResponseEntity.badRequest().body(err);
            }
        }

        if (updatedSubCategory.getName() != null && !updatedSubCategory.getName().trim().isEmpty()) {
            if (subCategoryRepository.existsByNameAndLanguageAndCategoryIdAndSubcategoryIdNot(name, lang, parentId, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Subcategory with name '" + name + "' already exists under this parent category");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setName(name);
        }

        existing.setParentCategoryId(parentId);
        existing.setLanguage(lang);

        // Validate hex color if provided
        if (updatedSubCategory.getColor() != null && !updatedSubCategory.getColor().trim().isEmpty()) {
            String hexColor = updatedSubCategory.getColor().trim();
            if (!hexColor.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Color must be a valid hex code (e.g. #3B82F6)");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setColor(hexColor);
        }

        if (updatedSubCategory.getSlug() != null && !updatedSubCategory.getSlug().trim().isEmpty()) {
            String slug = updatedSubCategory.getSlug().trim();
            if (subCategoryRepository.existsBySlugAndLanguageAndSubcategoryIdNot(slug, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setSlug(slug);
        }

        if (updatedSubCategory.getDescription() != null) existing.setDescription(updatedSubCategory.getDescription());
        if (updatedSubCategory.getKeywords() != null) existing.setKeywords(updatedSubCategory.getKeywords());
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
        // Block deletion if articles/posts are attached
        if (articleRepository.existsBySubcategoryId(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Cannot delete subcategory because it has articles/posts attached. Please reassign the posts first.");
            return ResponseEntity.badRequest().body(err);
        }
        subCategoryRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Subcategory deleted successfully");
        return ResponseEntity.ok(res);
    }
}
