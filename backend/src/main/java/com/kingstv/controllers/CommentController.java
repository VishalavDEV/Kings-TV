package com.kingstv.controllers;

import com.kingstv.models.Comment;
import com.kingstv.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    @GetMapping("/article/{articleId}")
    public List<Comment> getCommentsByArticleId(@PathVariable Long articleId) {
        return commentRepository.findByArticleId(articleId);
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Comment comment) {
        if (comment.getArticleId() == null || comment.getCommentorName() == null || comment.getCommentText() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "ArticleId, name, and comment text are required"));
        }
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(java.time.LocalDateTime.now());
        }
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable Long id) {
        Optional<Comment> commOpt = commentRepository.findById(id);
        if (commOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Comment not found"));
        }
        return ResponseEntity.ok(commOpt.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody Comment commentDetails) {
        Optional<Comment> commOpt = commentRepository.findById(id);
        if (commOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Comment not found"));
        }
        Comment comment = commOpt.get();
        comment.setCommentorName(commentDetails.getCommentorName());
        comment.setCommentorEmail(commentDetails.getCommentorEmail());
        comment.setCommentText(commentDetails.getCommentText());
        
        Comment updated = commentRepository.save(comment);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Optional<Comment> commOpt = commentRepository.findById(id);
        if (commOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Comment not found"));
        }
        commentRepository.delete(commOpt.get());
        return ResponseEntity.noContent().build();
    }
}
