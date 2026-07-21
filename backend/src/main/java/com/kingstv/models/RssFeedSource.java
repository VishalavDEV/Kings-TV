package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Admin-managed RSS feed source for the aggregator.
 * Replaces the hardcoded list in RssAggregatorService for sources
 * added via the admin panel.
 */
@Entity
@Table(name = "rss_feed_sources")
public class RssFeedSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_name", nullable = false)
    private String sourceName;

    @Column(name = "source_url", nullable = false, unique = true, length = 512)
    private String sourceUrl;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "auto_import_enabled", nullable = false)
    private Boolean autoImportEnabled = true;

    /** How often to import in minutes (default 180 = 3 h) */
    @Column(name = "import_interval_minutes", nullable = false)
    private Integer importIntervalMinutes = 180;

    @Column(name = "last_imported_at")
    private LocalDateTime lastImportedAt;

    @Column(name = "last_import_count")
    private Integer lastImportCount = 0;

    @Column(name = "last_import_status")
    private String lastImportStatus; // OK, ERROR

    @Column(name = "last_import_error", columnDefinition = "TEXT")
    private String lastImportError;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Boolean getAutoImportEnabled() { return autoImportEnabled; }
    public void setAutoImportEnabled(Boolean autoImportEnabled) { this.autoImportEnabled = autoImportEnabled; }

    public Integer getImportIntervalMinutes() { return importIntervalMinutes; }
    public void setImportIntervalMinutes(Integer importIntervalMinutes) { this.importIntervalMinutes = importIntervalMinutes; }

    public LocalDateTime getLastImportedAt() { return lastImportedAt; }
    public void setLastImportedAt(LocalDateTime lastImportedAt) { this.lastImportedAt = lastImportedAt; }

    public Integer getLastImportCount() { return lastImportCount; }
    public void setLastImportCount(Integer lastImportCount) { this.lastImportCount = lastImportCount; }

    public String getLastImportStatus() { return lastImportStatus; }
    public void setLastImportStatus(String lastImportStatus) { this.lastImportStatus = lastImportStatus; }

    public String getLastImportError() { return lastImportError; }
    public void setLastImportError(String lastImportError) { this.lastImportError = lastImportError; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
