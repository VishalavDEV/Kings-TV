package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_sensor_flags")
public class AiSensorFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType; // ARTICLE, CROWD_REPORT

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "content_title", length = 255)
    private String contentTitle;

    @Column(name = "flag_reason", nullable = false, length = 50)
    private String flagReason; // duplicate, plagiarism, low-quality, off-topic

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore = 0.0;

    @Column(name = "flag_description", columnDefinition = "TEXT")
    private String flagDescription;

    @Column(nullable = false, length = 30)
    private String status = "pending_review"; // pending_review, dismissed, actioned

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }
    public String getContentTitle() { return contentTitle; }
    public void setContentTitle(String contentTitle) { this.contentTitle = contentTitle; }
    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getFlagDescription() { return flagDescription; }
    public void setFlagDescription(String flagDescription) { this.flagDescription = flagDescription; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
