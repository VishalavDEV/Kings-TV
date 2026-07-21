package com.kingstv.controllers.admin;

import com.kingstv.models.Article;
import com.kingstv.models.Comment;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/comments")
public class AdminCommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public ResponseEntity<?> getComments(@RequestParam(required = false, defaultValue = "all") String status) {
        List<Comment> list;
        if ("all".equalsIgnoreCase(status) || status.isBlank()) {
            list = commentRepository.findAllByOrderByCreatedAtDesc();
        } else {
            list = commentRepository.findByStatusOrderByCreatedAtDesc(status.toLowerCase());
        }

        // Attach article title for UI display
        for (Comment c : list) {
            if (c.getArticleId() != null) {
                Optional<Article> aOpt = articleRepository.findById(c.getArticleId());
                aOpt.ifPresent(article -> c.setArticleTitle(
                    article.getTitleEn() != null ? article.getTitleEn() : article.getTitleTa()
                ));
            }
        }

        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Long id) {
        return commentRepository.findById(id).map(comment -> {
            comment.setStatus("approved");
            Comment updated = commentRepository.save(comment);
            return ResponseEntity.ok(Map.of("message", "Comment approved", "comment", updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectComment(@PathVariable Long id) {
        return commentRepository.findById(id).map(comment -> {
            comment.setStatus("rejected");
            Comment updated = commentRepository.save(comment);
            return ResponseEntity.ok(Map.of("message", "Comment rejected", "comment", updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }
}
