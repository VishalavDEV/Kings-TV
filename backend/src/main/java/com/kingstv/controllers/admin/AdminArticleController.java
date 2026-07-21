package com.kingstv.controllers.admin;

import com.kingstv.models.Article;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.services.SlugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/articles", "/api/v1/admin/articles"})
public class AdminArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SlugService slugService;

    @GetMapping
    public ResponseEntity<Page<Article>> getArticles(
            @RequestParam(required = false) String view,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String postType,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) Long subcategory,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());

        Specification<Article> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (view != null && !view.trim().isEmpty()) {
                String v = view.trim().toLowerCase();
                switch (v) {
                    case "slider":
                        predicates.add(cb.equal(root.get("isSlider"), true));
                        break;
                    case "featured":
                        predicates.add(cb.equal(root.get("isFeatured"), true));
                        break;
                    case "breaking":
                        predicates.add(cb.equal(root.get("isBreaking"), true));
                        break;
                    case "recommended":
                        predicates.add(cb.equal(root.get("isRecommended"), true));
                        break;
                    case "pending":
                        predicates.add(cb.equal(root.get("status"), "PENDING"));
                        break;
                    case "scheduled":
                        predicates.add(cb.equal(root.get("status"), "SCHEDULED"));
                        break;
                    case "draft":
                        predicates.add(cb.equal(root.get("status"), "DRAFT"));
                        break;
                }
            }

            if (language != null && !language.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("language"), language.trim()));
            }

            if (postType != null && !postType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("postType"), postType.trim().toUpperCase()));
            }

            if (user != null && !user.trim().isEmpty()) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("authorName")), "%" + user.toLowerCase() + "%"),
                    cb.equal(root.get("authorId").as(String.class), user.trim())
                ));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("categoryId"), category));
            }

            if (subcategory != null) {
                predicates.add(cb.equal(root.get("subcategoryId"), subcategory));
            }

            if (search != null && !search.trim().isEmpty()) {
                String s = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), s),
                    cb.like(cb.lower(root.get("titleTa")), s),
                    cb.like(cb.lower(root.get("titleEn")), s),
                    cb.like(cb.lower(root.get("content")), s)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ResponseEntity.ok(articleRepository.findAll(spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        Optional<Article> article = articleRepository.findById(id);
        if (article.isPresent()) {
            return ResponseEntity.ok(article.get());
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Article not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody Article article) {
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Article title is required");
            return ResponseEntity.badRequest().body(err);
        }

        String language = article.getLanguage() != null ? article.getLanguage().trim() : "ta";
        article.setLanguage(language);

        String title = article.getTitle().trim();
        article.setTitle(title);

        // Case-insensitive duplicate check in same language -> 409 Conflict
        if (articleRepository.existsByTitleIgnoreCaseAndLanguage(title, language) ||
            articleRepository.existsByTitleEnIgnoreCaseAndLanguage(title, language) ||
            articleRepository.existsByTitleTaIgnoreCaseAndLanguage(title, language)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An article with title '" + title + "' already exists for language '" + language + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        // Handle slug
        slugService.generateAndSetSlug(article);

        Article saved = articleRepository.save(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @RequestBody Article updatedArticle) {
        Optional<Article> existingOpt = articleRepository.findById(id);
        if (existingOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Article not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Article existing = existingOpt.get();

        String language = updatedArticle.getLanguage() != null ? updatedArticle.getLanguage().trim() : existing.getLanguage();
        String title = updatedArticle.getTitle() != null ? updatedArticle.getTitle().trim() : existing.getTitle();

        if (updatedArticle.getTitle() != null) {
            // Case-insensitive duplicate check -> 409 Conflict
            if (articleRepository.existsByTitleIgnoreCaseAndLanguageAndIdNot(title, language, id) ||
                articleRepository.existsByTitleEnIgnoreCaseAndLanguageAndIdNot(title, language, id) ||
                articleRepository.existsByTitleTaIgnoreCaseAndLanguageAndIdNot(title, language, id)) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "An article with title '" + title + "' already exists for language '" + language + "'");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
            existing.setTitle(title);
        }

        existing.setLanguage(language);

        if (updatedArticle.getSlug() != null && !updatedArticle.getSlug().trim().isEmpty()) {
            existing.setSlug(updatedArticle.getSlug().trim());
        }

        if (updatedArticle.getSummary() != null) existing.setSummary(updatedArticle.getSummary());
        if (updatedArticle.getContent() != null) existing.setContent(updatedArticle.getContent());
        if (updatedArticle.getFeaturedImageUrl() != null) existing.setFeaturedImageUrl(updatedArticle.getFeaturedImageUrl());
        if (updatedArticle.getCategoryId() != null) existing.setCategoryId(updatedArticle.getCategoryId());
        if (updatedArticle.getSubcategoryId() != null) existing.setSubcategoryId(updatedArticle.getSubcategoryId());
        if (updatedArticle.getAuthorId() != null) existing.setAuthorId(updatedArticle.getAuthorId());
        if (updatedArticle.getAuthorName() != null) existing.setAuthorName(updatedArticle.getAuthorName());
        
        if (updatedArticle.getIsFeatured() != null) existing.setIsFeatured(updatedArticle.getIsFeatured());
        if (updatedArticle.getIsBreaking() != null) existing.setIsBreaking(updatedArticle.getIsBreaking());
        if (updatedArticle.getIsSlider() != null) existing.setIsSlider(updatedArticle.getIsSlider());
        if (updatedArticle.getIsRecommended() != null) existing.setIsRecommended(updatedArticle.getIsRecommended());
        if (updatedArticle.getShowOnlyRegistered() != null) existing.setShowOnlyRegistered(updatedArticle.getShowOnlyRegistered());
        
        if (updatedArticle.getTags() != null) existing.setTags(updatedArticle.getTags());
        if (updatedArticle.getOptionalUrl() != null) existing.setOptionalUrl(updatedArticle.getOptionalUrl());
        if (updatedArticle.getVisibility() != null) existing.setVisibility(updatedArticle.getVisibility());
        if (updatedArticle.getShowRightColumn() != null) existing.setShowRightColumn(updatedArticle.getShowRightColumn());

        if (updatedArticle.getPostType() != null) existing.setPostType(updatedArticle.getPostType());
        if (updatedArticle.getGalleryImages() != null) existing.setGalleryImages(updatedArticle.getGalleryImages());
        if (updatedArticle.getSortedListItems() != null) existing.setSortedListItems(updatedArticle.getSortedListItems());
        if (updatedArticle.getVideoUrl() != null) existing.setVideoUrl(updatedArticle.getVideoUrl());
        if (updatedArticle.getVideoEmbedCode() != null) existing.setVideoEmbedCode(updatedArticle.getVideoEmbedCode());
        if (updatedArticle.getVideoThumbnailUrl() != null) existing.setVideoThumbnailUrl(updatedArticle.getVideoThumbnailUrl());
        if (updatedArticle.getAudioTracks() != null) existing.setAudioTracks(updatedArticle.getAudioTracks());
        if (updatedArticle.getQuizQuestions() != null) existing.setQuizQuestions(updatedArticle.getQuizQuestions());
        if (updatedArticle.getQuizResults() != null) existing.setQuizResults(updatedArticle.getQuizResults());

        if (updatedArticle.getFiles() != null) existing.setFiles(updatedArticle.getFiles());

        if (updatedArticle.getStatus() != null) {
            existing.setStatus(updatedArticle.getStatus());
        }
        if (updatedArticle.getScheduledAt() != null) {
            existing.setScheduledAt(updatedArticle.getScheduledAt());
        }

        Article saved = articleRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishArticle(@PathVariable Long id) {
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        Article article = articleOpt.get();
        article.setStatus("PUBLISHED");
        article.setPublishedAt(LocalDateTime.now());
        Article saved = articleRepository.save(article);
        return ResponseEntity.ok(Map.of("message", "Article published successfully", "article", saved));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> scheduleArticle(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        String scheduledAtStr = payload.get("scheduledAt");
        if (scheduledAtStr == null || scheduledAtStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "scheduledAt parameter is required"));
        }

        Article article = articleOpt.get();
        try {
            LocalDateTime scheduledDate = LocalDateTime.parse(scheduledAtStr);
            article.setScheduledAt(scheduledDate);
            article.setStatus("SCHEDULED");
            Article saved = articleRepository.save(article);
            return ResponseEntity.ok(Map.of("message", "Article scheduled successfully", "article", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Expected ISO-8601 (YYYY-MM-DDTHH:mm:ss)"));
        }
    }

    @PostMapping("/{id}/save-draft")
    public ResponseEntity<?> saveDraftArticle(@PathVariable Long id) {
        Optional<Article> articleOpt = articleRepository.findById(id);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        Article article = articleOpt.get();
        article.setStatus("DRAFT");
        Article saved = articleRepository.save(article);
        return ResponseEntity.ok(Map.of("message", "Article saved as draft", "article", saved));
    }

    @GetMapping({"/cron/publish-scheduled", "/cron/check-scheduled-posts"})
    public ResponseEntity<?> publishScheduledArticlesCron() {
        List<Article> scheduledArticles = articleRepository.findAll((root, query, cb) ->
            cb.and(
                cb.equal(root.get("status"), "SCHEDULED"),
                cb.lessThanOrEqualTo(root.get("scheduledAt"), LocalDateTime.now())
            )
        );

        int count = 0;
        for (Article a : scheduledArticles) {
            a.setStatus("PUBLISHED");
            a.setPublishedAt(LocalDateTime.now());
            articleRepository.save(a);
            count++;
        }

        return ResponseEntity.ok(Map.of(
            "message", "Cron check completed",
            "publishedCount", count,
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        if (!articleRepository.existsById(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Article not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        articleRepository.deleteById(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Article deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping({"/bulk-upload", "/posts/bulk-upload"})
    public ResponseEntity<?> bulkUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Uploaded file is empty");
            return ResponseEntity.badRequest().body(err);
        }

        int successCount = 0;
        int failureCount = 0;
        List<String> errorsList = new ArrayList<>();
        List<Map<String, Object>> rowDetails = new ArrayList<>();
        int rowIndex = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                rowIndex++;
                if (isHeader) {
                    isHeader = false; // Skip CSV header row
                    continue;
                }

                String[] columns = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
                if (columns.length < 3) {
                    failureCount++;
                    String errMsg = "Insufficient columns at row " + rowIndex;
                    errorsList.add(errMsg);
                    rowDetails.add(Map.of("row", rowIndex, "title", "N/A", "status", "FAILED", "reason", errMsg));
                    continue;
                }

                try {
                    String title = columns[0].replace("\"", "").trim();
                    String summary = columns[1].replace("\"", "").trim();
                    String content = columns[2].replace("\"", "").trim();
                    String language = columns.length > 3 ? columns[3].replace("\"", "").trim() : "ta";

                    if (title.isEmpty()) {
                        failureCount++;
                        String errMsg = "Empty title at row " + rowIndex;
                        errorsList.add(errMsg);
                        rowDetails.add(Map.of("row", rowIndex, "title", "N/A", "status", "FAILED", "reason", errMsg));
                        continue;
                    }

                    if (articleRepository.existsByTitleIgnoreCaseAndLanguage(title, language)) {
                        failureCount++;
                        String errMsg = "Duplicate title '" + title + "'";
                        errorsList.add(errMsg);
                        rowDetails.add(Map.of("row", rowIndex, "title", title, "status", "FAILED", "reason", errMsg));
                        continue;
                    }

                    Article article = new Article();
                    article.setTitle(title);
                    article.setSummary(summary);
                    article.setContent(content);
                    article.setLanguage(language);
                    article.setStatus("DRAFT");

                    slugService.generateAndSetSlug(article);
                    Article saved = articleRepository.save(article);
                    successCount++;
                    rowDetails.add(Map.of("row", rowIndex, "title", title, "status", "SUCCESS", "id", saved.getId(), "reason", "Imported as Draft"));
                } catch (Exception ex) {
                    failureCount++;
                    String errMsg = "Error: " + ex.getMessage();
                    errorsList.add(errMsg);
                    rowDetails.add(Map.of("row", rowIndex, "title", "N/A", "status", "FAILED", "reason", errMsg));
                }
            }
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Error parsing CSV file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("successCount", successCount);
        report.put("failureCount", failureCount);
        report.put("totalRows", successCount + failureCount);
        report.put("errors", errorsList);
        report.put("rowDetails", rowDetails);
        return ResponseEntity.ok(report);
    }
}
