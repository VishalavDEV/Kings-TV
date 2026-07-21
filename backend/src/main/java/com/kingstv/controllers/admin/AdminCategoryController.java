package com.kingstv.controllers.admin;

import com.kingstv.models.Category;
import com.kingstv.repository.CategoryRepository;
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
@RequestMapping({"/api/admin/categories", "/api/v1/admin/categories"})
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private ArticleRepository articleRepository;

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
        if (category.getName() == null || category.getName().trim().length() < 2 || category.getName().trim().length() > 100) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Category name must be between 2 and 100 characters");
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

        // Validate hex color
        if (category.getColor() != null && !category.getColor().trim().isEmpty()) {
            String hexColor = category.getColor().trim();
            if (!hexColor.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Color must be a valid hex code (e.g. #3B82F6)");
                return ResponseEntity.badRequest().body(err);
            }
            category.setColor(hexColor);
        }

        // Handle slug
        if (category.getSlug() != null && !category.getSlug().trim().isEmpty()) {
            String slug = category.getSlug().trim();
            if (categoryRepository.existsBySlugAndLanguage(slug, lang)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }
            category.setSlug(slug);
        } else {
            slugService.generateAndSetSlug(category);
        }

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

        String name = existing.getName();
        if (updatedCategory.getName() != null && !updatedCategory.getName().trim().isEmpty()) {
            name = updatedCategory.getName().trim();
            if (name.length() < 2 || name.length() > 100) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Category name must be between 2 and 100 characters");
                return ResponseEntity.badRequest().body(err);
            }
        }

        String lang = (updatedCategory.getLanguage() != null && !updatedCategory.getLanguage().trim().isEmpty())
                ? updatedCategory.getLanguage().trim() : existing.getLanguage();

        if (updatedCategory.getName() != null && !updatedCategory.getName().trim().isEmpty()) {
            if (categoryRepository.existsByNameAndLanguageAndIdNot(name, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Category with name '" + name + "' already exists for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setName(name);
        }
        existing.setLanguage(lang);

        // Validate hex color
        if (updatedCategory.getColor() != null && !updatedCategory.getColor().trim().isEmpty()) {
            String hexColor = updatedCategory.getColor().trim();
            if (!hexColor.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Color must be a valid hex code (e.g. #3B82F6)");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setColor(hexColor);
        }

        if (updatedCategory.getSlug() != null && !updatedCategory.getSlug().trim().isEmpty()) {
            String slug = updatedCategory.getSlug().trim();
            if (categoryRepository.existsBySlugAndLanguageAndIdNot(slug, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Slug '" + slug + "' is already in use for language '" + lang + "'");
                return ResponseEntity.badRequest().body(err);
            }
            existing.setSlug(slug);
        }

        if (updatedCategory.getDescription() != null) existing.setDescription(updatedCategory.getDescription());
        if (updatedCategory.getKeywords() != null) existing.setKeywords(updatedCategory.getKeywords());
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
        // Block deletion if subcategories are attached
        if (subCategoryRepository.existsByCategoryId(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Cannot delete category because it has subcategories attached. Please delete or reassign them first.");
            return ResponseEntity.badRequest().body(err);
        }
        // Block deletion if articles/posts are attached
        if (articleRepository.existsByCategoryId(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Cannot delete category because it has articles/posts attached. Please reassign the posts first.");
            return ResponseEntity.badRequest().body(err);
        }
        categoryRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Category deleted successfully");
        return ResponseEntity.ok(res);
    }
}
