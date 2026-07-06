package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "articles")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_id")
    private Long id;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "district_id")
    private Long districtId;

    @Column(name = "title_ta", nullable = false)
    private String titleTa;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "content_ta", nullable = false, columnDefinition = "TEXT")
    private String contentTa;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "short_desc_ta", columnDefinition = "TEXT")
    private String shortDescTa;

    @Column(name = "short_desc_en", columnDefinition = "TEXT")
    private String shortDescEn;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(nullable = false)
    private String status = "published";

    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
    public String getTitleTa() { return titleTa; }
    public void setTitleTa(String titleTa) { this.titleTa = titleTa; }
    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }
    public String getContentTa() { return contentTa; }
    public void setContentTa(String contentTa) { this.contentTa = contentTa; }
    public String getContentEn() { return contentEn; }
    public void setContentEn(String contentEn) { this.contentEn = contentEn; }
    public String getShortDescTa() { return shortDescTa; }
    public void setShortDescTa(String shortDescTa) { this.shortDescTa = shortDescTa; }
    public String getShortDescEn() { return shortDescEn; }
    public void setShortDescEn(String shortDescEn) { this.shortDescEn = shortDescEn; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
