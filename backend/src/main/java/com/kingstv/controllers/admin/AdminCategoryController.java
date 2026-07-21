package com.kingstv.controllers.admin;

import com.kingstv.models.Category;
import com.kingstv.repository.CategoryRepository;
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
@RequestMapping({"/api/admin/categories", "/api/v1/admin/categories"})
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SlugService slugService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            return ResponseEntity.ok(category.get());
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Category not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Category name is required");
            return ResponseEntity.badRequest().body(err);
        }

        String lang = (category.getLanguage() != null && !category.getLanguage().trim().isEmpty()) 
                ? category.getLanguage().trim() : "ta";
        category.setLanguage(lang);

        String name = category.getName().trim();
        category.setName(name);

        // Reject duplicate name + language
        if (categoryRepository.existsByNameAndLanguage(name, lang)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Category with name '" + name + "' already exists for language '" + lang + "'");
            return ResponseEntity.badRequest().body(err);
        }

        // Handle slug
        slugService.generateAndSetSlug(category);

        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category updatedCategory) {
        Optional<Category> existingOpt = categoryRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Category existing = existingOpt.get();

        if (updatedCategory.getName() != null && !updatedCategory.getName().trim().isEmpty()) {
            String name = updatedCategory.getName().trim();
            String lang = (updatedCategory.getLanguage() != null && !updatedCategory.getLanguage().trim().isEmpty())
                    ? updatedCategory.getLanguage().trim() : existing.getLanguage();

            if (categoryRepository.existsByNameAndLanguageAndIdNot(name, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Category with name '" + name + "' already exists for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }

            existing.setName(name);
            existing.setLanguage(lang);
        }

        if (updatedCategory.getSlug() != null && !updatedCategory.getSlug().trim().isEmpty()) {
            String slug = updatedCategory.getSlug().trim();
            if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setSlug(slug);
        }

        if (updatedCategory.getDescription() != null) existing.setDescription(updatedCategory.getDescription());
        if (updatedCategory.getKeywords() != null) existing.setKeywords(updatedCategory.getKeywords());
        if (updatedCategory.getColor() != null) existing.setColor(updatedCategory.getColor());
        if (updatedCategory.getMenuOrder() != null) existing.setMenuOrder(updatedCategory.getMenuOrder());
        if (updatedCategory.getShowOnMenu() != null) existing.setShowOnMenu(updatedCategory.getShowOnMenu());
        if (updatedCategory.getIsActive() != null) existing.setIsActive(updatedCategory.getIsActive());

        Category saved = categoryRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        categoryRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Category deleted successfully");
        return ResponseEntity.ok(res);
    }
}
