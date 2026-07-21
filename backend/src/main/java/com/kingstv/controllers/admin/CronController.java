package com.kingstv.controllers.admin;

import com.kingstv.models.Article;
import com.kingstv.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cron")
public class CronController {

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping("/publish-scheduled")
    public ResponseEntity<Map<String, Object>> publishScheduledArticles() {
        LocalDateTime now = LocalDateTime.now();
        List<Article> scheduled = articleRepository.findByStatusAndScheduledAtBefore("SCHEDULED", now);

        int count = 0;
        for (Article article : scheduled) {
            article.setStatus("PUBLISHED");
            article.setPublishedAt(now);
            articleRepository.save(article);
            count++;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Published " + count + " scheduled articles successfully.");
        result.put("publishedCount", count);
        return ResponseEntity.ok(result);
    }
}
