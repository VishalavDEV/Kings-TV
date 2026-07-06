package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Column(name = "commentor_name", nullable = false)
    private String commentorName;

    @Column(name = "commentor_email")
    private String commentorEmail;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getArticleId() { return articleId; }
    public void setArticleId(Long articleId) { this.articleId = articleId; }
    public String getCommentorName() { return commentorName; }
    public void setCommentorName(String commentorName) { this.commentorName = commentorName; }
    public String getCommentorEmail() { return commentorEmail; }
    public void setCommentorEmail(String commentorEmail) { this.commentorEmail = commentorEmail; }
    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
