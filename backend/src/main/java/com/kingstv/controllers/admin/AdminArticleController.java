package com.kingstv.controllers.admin;

import com.kingstv.models.Article;
import com.kingstv.models.Category;
import com.kingstv.models.SubCategory;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CategoryRepository;
import com.kingstv.repository.SubCategoryRepository;
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
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private SlugService slugService;

    @Autowired
    private com.kingstv.services.HtmlSanitizer htmlSanitizer;

    @Autowired
    private com.kingstv.services.ProfanityService profanityService;

    @Autowired
    private com.kingstv.services.AiCenterService aiCenterService;

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
        Pageable pageable;
        if ("breaking".equalsIgnoreCase(view)) {
            // Sort by breaking order first (nulls last/first - H2/JPA asc naturally puts numbers, then nulls or vice-versa)
            // To ensure sequence editors control sequence: sort by breakingOrder ASC, then publishedAt DESC
            pageable = PageRequest.of(page, size, Sort.by(Sort.Order.asc("breakingOrder"), Sort.Order.desc("publishedAt")));
        } else {
            pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        }

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
        ResponseEntity<?> validationRes = validateArticle(article);
        if (validationRes != null) {
            return validationRes;
        }

        if (article.getContent() != null) {
            article.setContent(htmlSanitizer.sanitize(article.getContent()));
        }

        String language = article.getLanguage();
        String title = article.getTitle().trim();
        article.setTitle(title);

        // Case-insensitive duplicate check in same language
        if (articleRepository.existsByTitleIgnoreCaseAndLanguage(title, language) ||
            articleRepository.existsByTitleEnIgnoreCaseAndLanguage(title, language) ||
            articleRepository.existsByTitleTaIgnoreCaseAndLanguage(title, language)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An article with title '" + title + "' already exists for language '" + language + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        // Case-insensitive slug uniqueness verification
        if (articleRepository.existsBySlugIgnoreCaseAndLanguage(article.getSlug(), language)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An article with slug '" + article.getSlug() + "' already exists for language '" + language + "'");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        java.util.List<String> matched = profanityService.findMatchedTerms(article.getTitle() + " " + article.getSummary() + " " + article.getContent());
        if (!matched.isEmpty()) {
            article.setStatus("FLAGGED_PROFANITY");
        }

        Article saved = articleRepository.save(article);
        if (!matched.isEmpty()) {
            profanityService.logViolation("ARTICLE", saved.getId(), saved.getTitle(), matched, saved.getAuthorId(), saved.getAuthorName());
        }
        
        // Hook AI Sensor Scan for duplicate/plagiarism/quality/off-topic check
        aiCenterService.scanContent("ARTICLE", saved.getId(), saved.getTitle(), saved.getContent());

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

        // Update core metadata fields to run validations
        if (updatedArticle.getTitle() != null) existing.setTitle(updatedArticle.getTitle());
        if (updatedArticle.getCategoryId() != null) existing.setCategoryId(updatedArticle.getCategoryId());
        if (updatedArticle.getLanguage() != null) existing.setLanguage(updatedArticle.getLanguage());
        if (updatedArticle.getSlug() != null) existing.setSlug(updatedArticle.getSlug());
        if (updatedArticle.getPostType() != null) existing.setPostType(updatedArticle.getPostType());
        if (updatedArticle.getImageUrl() != null) existing.setImageUrl(updatedArticle.getImageUrl());
        if (updatedArticle.getFeaturedImageUrl() != null) existing.setFeaturedImageUrl(updatedArticle.getFeaturedImageUrl());
        if (updatedArticle.getVideoUrl() != null) existing.setVideoUrl(updatedArticle.getVideoUrl());
        if (updatedArticle.getVideoEmbedCode() != null) existing.setVideoEmbedCode(updatedArticle.getVideoEmbedCode());
        if (updatedArticle.getAudioTracks() != null) existing.setAudioTracks(updatedArticle.getAudioTracks());
        if (updatedArticle.getQuizQuestions() != null) existing.setQuizQuestions(updatedArticle.getQuizQuestions());
        if (updatedArticle.getQuizResults() != null) existing.setQuizResults(updatedArticle.getQuizResults());

        ResponseEntity<?> validationRes = validateArticle(existing);
        if (validationRes != null) {
            return validationRes;
        }

        String language = existing.getLanguage();
        String title = existing.getTitle().trim();

        // Case-insensitive duplicate check
        if (articleRepository.existsByTitleIgnoreCaseAndLanguageAndIdNot(title, language, id) ||
            articleRepository.existsByTitleEnIgnoreCaseAndLanguageAndIdNot(title, language, id) ||
            articleRepository.existsByTitleTaIgnoreCaseAndLanguageAndIdNot(title, language, id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An article with title '" + title + "' already exists for language '" + language + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        // Case-insensitive slug uniqueness verification
        if (articleRepository.existsBySlugIgnoreCaseAndLanguageAndIdNot(existing.getSlug(), language, id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "An article with slug '" + existing.getSlug() + "' already exists for language '" + language + "'");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // Apply remaining updates
        if (updatedArticle.getSummary() != null) existing.setSummary(updatedArticle.getSummary());
        if (updatedArticle.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(updatedArticle.getContent()));
        } else if (existing.getContent() != null) {
            existing.setContent(htmlSanitizer.sanitize(existing.getContent()));
        }
        if (updatedArticle.getSubcategoryId() != null) existing.setSubcategoryId(updatedArticle.getSubcategoryId());
        if (updatedArticle.getAuthorId() != null) existing.setAuthorId(updatedArticle.getAuthorId());
        if (updatedArticle.getAuthorName() != null) existing.setAuthorName(updatedArticle.getAuthorName());
        
        if (updatedArticle.getIsFeatured() != null) existing.setIsFeatured(updatedArticle.getIsFeatured());
        if (updatedArticle.getIsBreaking() != null) existing.setIsBreaking(updatedArticle.getIsBreaking());
        if (updatedArticle.getIsSlider() != null) existing.setIsSlider(updatedArticle.getIsSlider());
        if (updatedArticle.getIsRecommended() != null) existing.setIsRecommended(updatedArticle.getIsRecommended());
        if (updatedArticle.getShowOnlyRegistered() != null) existing.setShowOnlyRegistered(updatedArticle.getShowOnlyRegistered());
        if (updatedArticle.getBreakingOrder() != null) existing.setBreakingOrder(updatedArticle.getBreakingOrder());
        
        if (updatedArticle.getTags() != null) existing.setTags(updatedArticle.getTags());
        if (updatedArticle.getOptionalUrl() != null) existing.setOptionalUrl(updatedArticle.getOptionalUrl());
        if (updatedArticle.getVisibility() != null) existing.setVisibility(updatedArticle.getVisibility());
        if (updatedArticle.getShowRightColumn() != null) existing.setShowRightColumn(updatedArticle.getShowRightColumn());
        if (updatedArticle.getGalleryImages() != null) existing.setGalleryImages(updatedArticle.getGalleryImages());
        if (updatedArticle.getSortedListItems() != null) existing.setSortedListItems(updatedArticle.getSortedListItems());
        if (updatedArticle.getVideoThumbnailUrl() != null) existing.setVideoThumbnailUrl(updatedArticle.getVideoThumbnailUrl());
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

    @PatchMapping("/{id}/toggleFlag")
    public ResponseEntity<?> toggleFlag(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (!body.containsKey("flagName") || !body.containsKey("value")) {
            return ResponseEntity.badRequest().body(Map.of("error", "flagName and value parameters are required"));
        }
        String flagName = body.get("flagName").toString();
        
        Optional<Article> opt = articleRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        
        Article article = opt.get();
        if ("isFeatured".equals(flagName)) {
            article.setIsFeatured(Boolean.parseBoolean(body.get("value").toString()));
        } else if ("isBreaking".equals(flagName)) {
            article.setIsBreaking(Boolean.parseBoolean(body.get("value").toString()));
        } else if ("isSlider".equals(flagName)) {
            article.setIsSlider(Boolean.parseBoolean(body.get("value").toString()));
        } else if ("isRecommended".equals(flagName)) {
            article.setIsRecommended(Boolean.parseBoolean(body.get("value").toString()));
        } else if ("showOnlyRegistered".equals(flagName)) {
            article.setShowOnlyRegistered(Boolean.parseBoolean(body.get("value").toString()));
        } else if ("breakingOrder".equals(flagName)) {
            if (body.get("value") == null || body.get("value").toString().trim().isEmpty()) {
                article.setBreakingOrder(null);
            } else {
                try {
                    article.setBreakingOrder(Integer.parseInt(body.get("value").toString()));
                } catch (Exception e) {
                    article.setBreakingOrder(null);
                }
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid flagName. Supported: isFeatured, isBreaking, isSlider, isRecommended, showOnlyRegistered, breakingOrder"));
        }
        
        Article saved = articleRepository.save(article);
        return ResponseEntity.ok(Map.of("message", "Flag updated successfully", "id", id, flagName, body.get("value")));
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

    @GetMapping("/bulk-template")
    public ResponseEntity<byte[]> getBulkTemplate() {
        String csv = "title,summary,content,language,categoryId,subcategoryId\n" +
                "\"Sample English Article\",\"This is the summary\",\"<p>This is the detailed HTML content</p>\",\"en\",1,1\n" +
                "\"மாதிரி தமிழ் கட்டுரை\",\"இது சுருக்கம்\",\"<p>இது விரிவான உள்ளடக்கம்</p>\",\"ta\",1,2\n";
        byte[] output = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=bulk_posts_template.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(output);
    }

    @GetMapping("/categories-reference")
    public ResponseEntity<?> getCategoriesReference() {
        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> refList = new ArrayList<>();
        for (Category c : categories) {
            Map<String, Object> cMap = new HashMap<>();
            cMap.put("id", c.getId());
            cMap.put("name", c.getName());
            cMap.put("language", c.getLanguage());
            List<Map<String, Object>> subList = new ArrayList<>();
            List<com.kingstv.models.SubCategory> subcategories = subCategoryRepository.findByCategoryId(c.getId());
            for (com.kingstv.models.SubCategory sc : subcategories) {
                Map<String, Object> scMap = new HashMap<>();
                scMap.put("id", sc.getId());
                scMap.put("name", sc.getName());
                subList.add(scMap);
            }
            cMap.put("subcategories", subList);
            refList.add(cMap);
        }
        return ResponseEntity.ok(refList);
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
                    Long categoryId = null;
                    Long subcategoryId = null;
                    
                    if (columns.length > 4) {
                        try {
                            categoryId = Long.parseLong(columns[4].replace("\"", "").trim());
                        } catch (Exception e) {}
                    }
                    if (columns.length > 5) {
                        try {
                            subcategoryId = Long.parseLong(columns[5].replace("\"", "").trim());
                        } catch (Exception e) {}
                    }

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
                    article.setCategoryId(categoryId);
                    article.setSubcategoryId(subcategoryId);
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

    private ResponseEntity<?> validateArticle(Article article) {
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Article title is required"));
        }
        if (article.getCategoryId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category is required"));
        }

        String language = article.getLanguage() != null ? article.getLanguage().trim() : "ta";
        article.setLanguage(language);

        String slug = article.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            String title = article.getTitleEn() != null && !article.getTitleEn().trim().isEmpty() ? article.getTitleEn() : article.getTitle();
            slug = cleanSlug(title);
        } else {
            slug = cleanSlug(slug);
        }
        article.setSlug(slug);

        String postType = article.getPostType() != null ? article.getPostType().trim().toUpperCase() : "ARTICLE";
        article.setPostType(postType);

        if ("ARTICLE".equals(postType) || "GALLERY".equals(postType) || "SORTED_LIST".equals(postType) || "PAGE".equals(postType)) {
            if ((article.getImageUrl() == null || article.getImageUrl().trim().isEmpty()) && 
                (article.getFeaturedImageUrl() == null || article.getFeaturedImageUrl().trim().isEmpty())) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one main post image or featured image URL is required for " + postType.toLowerCase() + " format."));
            }
        } else if ("VIDEO".equals(postType)) {
            if ((article.getVideoUrl() == null || article.getVideoUrl().trim().isEmpty()) &&
                (article.getVideoEmbedCode() == null || article.getVideoEmbedCode().trim().isEmpty())) {
                return ResponseEntity.badRequest().body(Map.of("error", "A valid video URL or video embed code is required for video format."));
            }
        } else if ("AUDIO".equals(postType)) {
            if (article.getAudioTracks() == null || article.getAudioTracks().trim().isEmpty() || "[]".equals(article.getAudioTracks().trim())) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one audio track is required for audio format."));
            }
        } else if ("TRIVIA_QUIZ".equals(postType) || "PERSONALITY_QUIZ".equals(postType)) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<?> questionsList = mapper.readValue(article.getQuizQuestions(), List.class);
                if (questionsList == null || questionsList.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "At least one question is required for quiz format."));
                }
                for (Object questionObj : questionsList) {
                    Map<?, ?> question = (Map<?, ?>) questionObj;
                    List<?> answers = (List<?>) question.get("answers");
                    if (answers == null || answers.size() < 2) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Each question in a quiz must have at least 2 choice answers."));
                    }
                }
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz questions JSON structure is invalid. Each question requires answers list."));
            }
        }

        return null;
    }

    private String cleanSlug(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("[^a-zA-Z0-9\\u0B80-\\u0BFF\\s\\-]", "");
        cleaned = cleaned.trim().replaceAll("\\s+", "-").replaceAll("-+", "-").toLowerCase();
        if (cleaned.isEmpty()) {
            cleaned = "post-" + System.currentTimeMillis();
        }
        return cleaned;
    }
}
