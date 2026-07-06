package com.kingstv.controllers;

import com.kingstv.models.Article;
import com.kingstv.models.Comment;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Article> getArticles(@RequestParam(required = false) String status) {
        String activeStatus = status != null ? status : "published";
        return articleRepository.findByStatusOrderByPublishedAtDesc(activeStatus);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable Long id) {
        Optional<Article> artOpt = articleRepository.findById(id);
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }

        Article article = artOpt.get();
        article.setViewsCount(article.getViewsCount() + 1);
        articleRepository.save(article);

        return ResponseEntity.ok(article);
    }

    @PostMapping
    public ResponseEntity<?> createArticle(@RequestBody Article article) {
        if (article.getTitleTa() == null || article.getContentTa() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title (Tamil) and Content (Tamil) are required"));
        }
        Article saved = articleRepository.save(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @RequestBody Article articleDetails) {
        Optional<Article> artOpt = articleRepository.findById(id);
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        
        Article article = artOpt.get();
        article.setCategoryId(articleDetails.getCategoryId());
        article.setDistrictId(articleDetails.getDistrictId());
        article.setTitleTa(articleDetails.getTitleTa());
        article.setTitleEn(articleDetails.getTitleEn());
        article.setContentTa(articleDetails.getContentTa());
        article.setContentEn(articleDetails.getContentEn());
        article.setShortDescTa(articleDetails.getShortDescTa());
        article.setShortDescEn(articleDetails.getShortDescEn());
        article.setImageUrl(articleDetails.getImageUrl());
        article.setStatus(articleDetails.getStatus());
        
        Article updated = articleRepository.save(article);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        Optional<Article> artOpt = articleRepository.findById(id);
        if (artOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article not found"));
        }
        articleRepository.delete(artOpt.get());
        return ResponseEntity.noContent().build();
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
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
