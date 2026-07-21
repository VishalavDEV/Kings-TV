package com.kingstv.controllers.admin;

import com.kingstv.models.CustomPage;
import com.kingstv.repository.CustomPageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/admin/pages", "/api/v1/admin/pages"})
public class AdminPageController {

    @Autowired
    private CustomPageRepository pageRepository;

    @GetMapping
    public ResponseEntity<List<CustomPage>> getAllPages() {
        return ResponseEntity.ok(pageRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPageById(@PathVariable Long id) {
        Optional<CustomPage> page = pageRepository.findById(id);
        if (page.isPresent()) {
            return ResponseEntity.ok(page.get());
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Page not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @PostMapping
    public ResponseEntity<?> createPage(@RequestBody CustomPage page) {
        if (page.getTitle() == null || page.getTitle().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Page title is required");
            return ResponseEntity.badRequest().body(err);
        }

        String slug = page.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = page.getTitle().toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-");
        } else {
            slug = slug.trim().toLowerCase();
        }
        page.setSlug(slug);

        if (pageRepository.existsBySlugIgnoreCase(slug)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "A page with slug '" + slug + "' already exists.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        CustomPage saved = pageRepository.save(page);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePage(@PathVariable Long id, @RequestBody CustomPage updatedPage) {
        Optional<CustomPage> existingOpt = pageRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Page not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        CustomPage existing = existingOpt.get();

        String slug = updatedPage.getSlug();
        if (slug != null && !slug.trim().isEmpty()) {
            slug = slug.trim().toLowerCase();
            if (pageRepository.existsBySlugIgnoreCaseAndIdNot(slug, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "A page with slug '" + slug + "' already exists.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }
            existing.setSlug(slug);
        }

        if (updatedPage.getTitle() != null) existing.setTitle(updatedPage.getTitle());
        if (updatedPage.getDescription() != null) existing.setDescription(updatedPage.getDescription());
        if (updatedPage.getKeywords() != null) existing.setKeywords(updatedPage.getKeywords());
        if (updatedPage.getLanguage() != null) existing.setLanguage(updatedPage.getLanguage());
        if (updatedPage.getParentLinkId() != null) existing.setParentLinkId(updatedPage.getParentLinkId());
        if (updatedPage.getMenuOrder() != null) existing.setMenuOrder(updatedPage.getMenuOrder());
        if (updatedPage.getLocation() != null) existing.setLocation(updatedPage.getLocation());
        if (updatedPage.getContent() != null) existing.setContent(updatedPage.getContent());

        CustomPage saved = pageRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePage(@PathVariable Long id) {
        if (!pageRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Page not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        pageRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Page deleted successfully");
        return ResponseEntity.ok(res);
    }
}
