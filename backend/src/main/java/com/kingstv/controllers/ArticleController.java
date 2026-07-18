package com.kingstv.controllers;

import com.kingstv.models.Article;
import com.kingstv.models.Comment;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CommentRepository;
import com.kingstv.services.SlugService;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private SlugService slugService;

    @Autowired
    private com.kingstv.services.AiAssistService aiAssistService;

    // --- KEEP Existing Front-End Endpoint Map ---
    @GetMapping
    public List<Article> getArticles(@RequestParam(required = false) String status) {
        String activeStatus = status != null ? status : "published";
        return articleRepository.findTop50ByStatusOrderByPublishedAtDesc(activeStatus);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<?> getArticleById(@PathVariable String idOrSlug, HttpServletRequest request) {
        Optional<Article> artOpt = Optional.empty();
        
        // Try parsing numerical ID first
        if (idOrSlug.matches("^\\d+$")) {
            artOpt = articleRepository.findById(Long.parseLong(idOrSlug));
        }
        
        // Fall back to slug lookup
        if (artOpt.isEmpty()) {
            artOpt = articleRepository.findBySlug(idOrSlug);
        }
        
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }

        Article article = artOpt.get();
        article.setViewsCount(article.getViewsCount() + 1);
        articleRepository.save(article);

        // Dynamic JSON-LD structured data attachment
        article.setStructuredDataJson(generateJsonLd(article, request));

        return ResponseEntity.ok(article);
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody Article article, HttpServletRequest request) {
        if (article.getTitleTa() == null || article.getContentTa() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title (Tamil) and Content (Tamil) are required"));
        }
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        populateSeoFields(article, request);
        Article saved = articleRepository.save(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --- NEW Standardized API Standard Endpoints ---
    @GetMapping("/getAll")
    public Page<Article> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Article> spec = SpecificationBuilder.build(search, status, categoryId, districtId);
        return articleRepository.findAll(spec, pageable);
    }

    @GetMapping("/getAllWeb")
    public Page<Article> getAllWeb(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publishedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        return getAll(search, "published", categoryId, districtId, page, size, sortBy, direction);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> save(@RequestBody Article entity, HttpServletRequest request) {
        return createArticle(entity, request);
    }

    @PutMapping("/saveUpdate")
    public ResponseEntity<?> update(@RequestBody Article entity, HttpServletRequest request) {
        if (entity.getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id is required for update"));
        }
        Optional<Article> artOpt = articleRepository.findById(entity.getId());
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        
        Article article = artOpt.get();
        article.setCategoryId(entity.getCategoryId());
        article.setDistrictId(entity.getDistrictId());
        article.setTitleTa(entity.getTitleTa());
        article.setTitleEn(entity.getTitleEn());
        article.setContentTa(entity.getContentTa());
        article.setContentEn(entity.getContentEn());
        article.setShortDescTa(entity.getShortDescTa());
        article.setShortDescEn(entity.getShortDescEn());
        article.setImageUrl(entity.getImageUrl());
        article.setStatus(entity.getStatus());

        // SEO Fields
        article.setMetaTitle(entity.getMetaTitle());
        article.setMetaDescription(entity.getMetaDescription());
        article.setMetaKeywords(entity.getMetaKeywords());
        article.setSlug(entity.getSlug());
        article.setCanonicalUrl(entity.getCanonicalUrl());
        article.setFeaturedImage(entity.getFeaturedImage());
        article.setAuthorName(entity.getAuthorName());
        article.setSeoStatus(entity.getSeoStatus());
        
        populateSeoFields(article, request);
        Article updated = articleRepository.save(article);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/changeStatus")
    public ResponseEntity<?> changeStatus(@RequestBody Map<String, Object> request) {
        if (!request.containsKey("id") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("message", "id and status are required"));
        }
        Long id = Long.valueOf(request.get("id").toString());
        String status = request.get("status").toString();
        
        Optional<Article> opt = articleRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        Article existing = opt.get();
        existing.setStatus(status);
        articleRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully", "id", id, "status", status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        Optional<Article> artOpt = articleRepository.findById(id);
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        Article existing = artOpt.get();
        existing.setStatus("deleted"); // Soft delete
        articleRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Article soft-deleted successfully"));
    }

    // Article Comments Endpoints
    @GetMapping("/{id}/comments")
    public List<Comment> getCommentsForArticle(@PathVariable Long id) {
        return commentRepository.findByArticleId(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addCommentToArticle(@PathVariable Long id, @RequestBody Comment comment) {
        Optional<Article> artOpt = articleRepository.findById(id);
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        if (comment.getCommentorName() == null || comment.getCommentText() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Commentor name and comment text are required"));
        }
        comment.setArticleId(id);
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(LocalDateTime.now());
        }
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Helper methods for SEO
    private void populateSeoFields(Article article, HttpServletRequest request) {
        slugService.generateAndSetSlug(article);
        
        if (article.getMetaTitle() == null || article.getMetaTitle().trim().isEmpty()) {
            article.setMetaTitle(article.getTitleTa() != null ? article.getTitleTa() : article.getTitleEn());
        }
        if (article.getMetaDescription() == null || article.getMetaDescription().trim().isEmpty()) {
            String desc = article.getShortDescTa() != null ? article.getShortDescTa() : article.getShortDescEn();
            if (desc == null) {
                desc = article.getContentTa();
            }
            if (desc != null && desc.length() > 160) {
                desc = desc.substring(0, 157) + "...";
            }
            article.setMetaDescription(desc);
        }
        if (article.getMetaKeywords() == null || article.getMetaKeywords().trim().isEmpty()) {
            article.setMetaKeywords("news, Tamil news, Kings TV, " + (article.getTitleEn() != null ? article.getTitleEn() : ""));
        }
        if (article.getFeaturedImage() == null || article.getFeaturedImage().trim().isEmpty()) {
            article.setFeaturedImage(article.getImageUrl());
        }
        if (article.getCanonicalUrl() == null || article.getCanonicalUrl().trim().isEmpty()) {
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int port = request.getServerPort();
            String portStr = (port == 8080) ? ":5173" : ((port != 80 && port != 443) ? ":" + port : "");
            article.setCanonicalUrl(scheme + "://" + serverName + portStr + "/news/" + article.getSlug());
        }
    }

    private String generateJsonLd(Article article, HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        String portStr = (port == 8080) ? ":5173" : ((port != 80 && port != 443) ? ":" + port : "");
        String baseUrl = scheme + "://" + serverName + portStr;
        
        String headline = article.getTitleTa() != null ? article.getTitleTa() : article.getTitleEn();
        String description = article.getMetaDescription() != null ? article.getMetaDescription() : "";
        String imageUrl = article.getImageUrl() != null ? article.getImageUrl() : (baseUrl + "/assets/images/default-news.png");
        if (imageUrl.startsWith("/")) {
            imageUrl = baseUrl + imageUrl;
        }
        String pubDate = article.getPublishedAt() != null ? article.getPublishedAt().toString() : LocalDateTime.now().toString();
        String modDate = article.getUpdatedAt() != null ? article.getUpdatedAt().toString() : pubDate;
        String author = article.getAuthorName() != null ? article.getAuthorName() : "Kings TV News Desk";
        
        // Escape quotes
        headline = headline.replace("\"", "\\\"");
        description = description.replace("\"", "\\\"");
        author = author.replace("\"", "\\\"");
        
        return "{\n" +
                "  \"@context\": \"https://schema.org\",\n" +
                "  \"@type\": \"NewsArticle\",\n" +
                "  \"headline\": \"" + headline + "\",\n" +
                "  \"description\": \"" + description + "\",\n" +
                "  \"image\": [\n" +
                "    \"" + imageUrl + "\"\n" +
                "  ],\n" +
                "  \"datePublished\": \"" + pubDate + "\",\n" +
                "  \"dateModified\": \"" + modDate + "\",\n" +
                "  \"author\": [{\n" +
                "    \"@type\": \"Person\",\n" +
                "    \"name\": \"" + author + "\"\n" +
                "  }],\n" +
                "  \"publisher\": {\n" +
                "    \"@type\": \"Organization\",\n" +
                "    \"name\": \"KINGS 24x7\",\n" +
                "    \"logo\": {\n" +
                "      \"@type\": \"ImageObject\",\n" +
                "      \"url\": \"" + baseUrl + "/assets/icons/logo.png\"\n" +
                "    }\n" +
                "  }\n" +
                "}";
    }

    @PostMapping("/ai-assist")
    public ResponseEntity<?> aiAssist(@RequestBody Map<String, String> payload) {
        String action = payload.get("action");
        String text = payload.get("text");
        String context = payload.get("context");

        if (action == null || text == null) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "result", "Action and text are required"));
        }

        Map<String, Object> result = aiAssistService.assist(action, text, context);
        if (Boolean.TRUE.equals(result.get("error"))) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        try {
            Path uploadPath = Paths.get("uploads/articles");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String contentType = file.getContentType();
            String extension = ".jpg";
            if (contentType != null) {
                if (contentType.equals("image/png")) {
                    extension = ".png";
                } else if (contentType.equals("image/gif")) {
                    extension = ".gif";
                } else if (contentType.equals("image/webp")) {
                    extension = ".webp";
                } else if (contentType.startsWith("video/")) {
                    if (contentType.equals("video/mp4")) {
                        extension = ".mp4";
                    } else if (contentType.equals("video/webm")) {
                        extension = ".webm";
                    } else {
                        extension = ".mp4"; // fallback
                    }
                }
            }
            String prefix = contentType != null && contentType.startsWith("video/") ? "video_" : "article_";
            String fileName = prefix + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000) + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("url", "/uploads/articles/" + fileName));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload file: " + e.getMessage()));
        }
    }
}
