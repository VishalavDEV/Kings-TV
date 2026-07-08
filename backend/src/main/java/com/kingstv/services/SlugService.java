package com.kingstv.services;

import com.kingstv.models.Article;
import com.kingstv.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class SlugService {

    @Autowired
    private ArticleRepository articleRepository;

    public String generateAndSetSlug(Article article) {
        String slug = article.getSlug();
        if (slug != null && !slug.trim().isEmpty()) {
            slug = cleanSlug(slug);
        } else {
            String title = article.getTitleEn();
            if (title == null || title.trim().isEmpty()) {
                title = article.getTitleTa();
            }
            if (title == null || title.trim().isEmpty()) {
                title = "article-" + System.currentTimeMillis();
            }
            slug = cleanSlug(title);
        }

        // Handle duplication resolution
        String finalSlug = slug;
        int counter = 1;
        while (true) {
            Optional<Article> existing = articleRepository.findBySlug(finalSlug);
            if (existing.isPresent()) {
                // If it is the same article, keep it
                if (article.getId() != null && existing.get().getId().equals(article.getId())) {
                    break;
                }
                finalSlug = slug + "-" + counter;
                counter++;
            } else {
                break;
            }
        }

        article.setSlug(finalSlug);
        return finalSlug;
    }

    private String cleanSlug(String text) {
        if (text == null) return "";
        // Keep English, numbers, Tamil characters (\u0B80-\u0BFF), space, hyphen
        String cleaned = text.replaceAll("[^a-zA-Z0-9\\u0B80-\\u0BFF\\s\\-]", "");
        cleaned = cleaned.trim().replaceAll("\\s+", "-").replaceAll("-+", "-").toLowerCase();
        if (cleaned.isEmpty()) {
            cleaned = "news-" + System.currentTimeMillis();
        }
        return cleaned;
    }
}
