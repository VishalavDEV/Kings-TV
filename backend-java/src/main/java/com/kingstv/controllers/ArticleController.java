package com.kingstv.controllers;

import com.kingstv.models.Article;
import com.kingstv.repository.ArticleRepository;
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
}
