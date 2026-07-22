package com.kingstv.controllers.admin;

import com.kingstv.models.CustomPage;
import com.kingstv.repository.CustomPageRepository;
import com.kingstv.services.HtmlSanitizer;
import java.time.LocalDateTime;
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

    @Autowired
    private HtmlSanitizer htmlSanitizer;

    @Autowired
    private com.kingstv.repository.PageVersionHistoryRepository pageVersionHistoryRepository;

    @Autowired
    private com.kingstv.repository.GeneralApplicationRepository generalApplicationRepository;

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

        String lang = (page.getLanguage() != null && !page.getLanguage().trim().isEmpty()) 
                ? page.getLanguage().trim() : "ta";
        page.setLanguage(lang);

        String location = page.getLocation() != null ? page.getLocation().trim() : "NONE";
        page.setLocation(location);

        if (!"NONE".equalsIgnoreCase(location)) {
            if (page.getMenuOrder() == null || page.getMenuOrder() < 0) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Menu order position is required and must be 0 or greater when Page is added to a Menu.");
                return ResponseEntity.badRequest().body(err);
            }
        } else {
            if (page.getMenuOrder() == null) {
                page.setMenuOrder(0);
            }
        }

        String slug = page.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = cleanSlug(page.getTitle());
        } else {
            slug = cleanSlug(slug);
        }
        page.setSlug(slug);

        if (pageRepository.existsBySlugIgnoreCaseAndLanguage(slug, lang)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "A page with slug '" + slug + "' already exists for language '" + lang + "'.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (page.getVisibility() == null || page.getVisibility().trim().isEmpty()) {
            page.setVisibility("Public");
        }
        if (page.getPageType() == null || page.getPageType().trim().isEmpty()) {
            page.setPageType("custom");
        }

        if (page.getContent() != null) {
            page.setContent(htmlSanitizer.sanitize(page.getContent()));
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

        String lang = (updatedPage.getLanguage() != null && !updatedPage.getLanguage().trim().isEmpty())
                ? updatedPage.getLanguage().trim() : existing.getLanguage();

        String title = updatedPage.getTitle() != null ? updatedPage.getTitle() : existing.getTitle();
        if (title == null || title.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Page title is required");
            return ResponseEntity.badRequest().body(err);
        }

        String location = updatedPage.getLocation() != null ? updatedPage.getLocation().trim() : existing.getLocation();
        Integer menuOrder = updatedPage.getMenuOrder() != null ? updatedPage.getMenuOrder() : existing.getMenuOrder();

        if (!"NONE".equalsIgnoreCase(location)) {
            if (menuOrder == null || menuOrder < 0) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Menu order position is required and must be 0 or greater when Page is added to a Menu.");
                return ResponseEntity.badRequest().body(err);
            }
        }

        String slug = updatedPage.getSlug();
        if (slug != null && !slug.trim().isEmpty()) {
            slug = cleanSlug(slug);
            if (pageRepository.existsBySlugIgnoreCaseAndLanguageAndIdNot(slug, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "A page with slug '" + slug + "' already exists for language '" + lang + "'.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }
            existing.setSlug(slug);
        } else if (updatedPage.getTitle() != null) {
            slug = cleanSlug(title);
            if (pageRepository.existsBySlugIgnoreCaseAndLanguageAndIdNot(slug, lang, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "A page with slug '" + slug + "' already exists for language '" + lang + "'.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }
            existing.setSlug(slug);
        }

        existing.setTitle(title);
        existing.setLanguage(lang);
        existing.setLocation(location);
        existing.setMenuOrder(menuOrder);

        if (updatedPage.getDescription() != null) existing.setDescription(updatedPage.getDescription());
        if (updatedPage.getKeywords() != null) existing.setKeywords(updatedPage.getKeywords());
        if (updatedPage.getParentLinkId() != null) existing.setParentLinkId(updatedPage.getParentLinkId());
        
        if (updatedPage.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(updatedPage.getContent()));
        } else if (existing.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(existing.getContent()));
        }
        
        if (updatedPage.getVisibility() != null) existing.setVisibility(updatedPage.getVisibility());
        if (updatedPage.getPageType() != null) existing.setPageType(updatedPage.getPageType());

        // Specialized columns copy
        if (updatedPage.getTeamMembers() != null) existing.setTeamMembers(updatedPage.getTeamMembers());
        if (updatedPage.getMilestones() != null) existing.setMilestones(updatedPage.getMilestones());
        if (updatedPage.getPhoneNumbers() != null) existing.setPhoneNumbers(updatedPage.getPhoneNumbers());
        if (updatedPage.getEmailAddresses() != null) existing.setEmailAddresses(updatedPage.getEmailAddresses());
        if (updatedPage.getOfficeHours() != null) existing.setOfficeHours(updatedPage.getOfficeHours());
        if (updatedPage.getEmbeddedMap() != null) existing.setEmbeddedMap(updatedPage.getEmbeddedMap());
        if (updatedPage.getVersion() != null) existing.setVersion(updatedPage.getVersion());
        if (updatedPage.getEffectiveDate() != null) existing.setEffectiveDate(updatedPage.getEffectiveDate());

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

    @PutMapping("/{id}/publish-version")
    public ResponseEntity<?> publishNewVersion(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> body) {
        Optional<CustomPage> existingOpt = pageRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Page not found"));
        }

        CustomPage page = existingOpt.get();

        // 1. Archive current version to page_version_history
        com.kingstv.models.PageVersionHistory history = new com.kingstv.models.PageVersionHistory(
            page.getId(),
            page.getTitle(),
            page.getContent(),
            page.getVersion(),
            page.getEffectiveDate() != null ? page.getEffectiveDate() : LocalDateTime.now()
        );
        pageVersionHistoryRepository.save(history);

        // 2. Set new values
        if (body.containsKey("content")) {
            String newContent = (String) body.get("content");
            page.setContent(htmlSanitizer.sanitize(newContent));
        }
        
        page.setVersion(page.getVersion() + 1);
        page.setEffectiveDate(LocalDateTime.now());

        CustomPage saved = pageRepository.save(page);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<?> getPageVersions(@PathVariable Long id) {
        return ResponseEntity.ok(pageVersionHistoryRepository.findByPageIdOrderByVersionDesc(id));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getGeneralApplications() {
        return ResponseEntity.ok(generalApplicationRepository.findAll(
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        ));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        if (!generalApplicationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Application not found"));
        }
        generalApplicationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
    }

    private String cleanSlug(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("[^a-zA-Z0-9\\u0B80-\\u0BFF\\s\\-]", "");
        cleaned = cleaned.trim().replaceAll("\\s+", "-").replaceAll("-+", "-").toLowerCase();
        if (cleaned.isEmpty()) {
            cleaned = "page-" + System.currentTimeMillis();
        }
        return cleaned;
    }
}
