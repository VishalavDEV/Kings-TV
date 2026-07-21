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

    @Column(name = "subcategory_id")
    private Long subcategoryId;

    @Column(name = "district_id")
    private Long districtId;

    @Column(name = "constituency")
    private String constituency;

    @Column(name = "title_ta")
    private String titleTa;

    @Column(name = "title_en")
    private String titleEn;

    @Column(nullable = false)
    private String title;

    @Column(name = "content_ta", columnDefinition = "LONGTEXT")
    private String contentTa;

    @Column(name = "content_en", columnDefinition = "LONGTEXT")
    private String contentEn;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "short_desc_ta", columnDefinition = "TEXT")
    private String shortDescTa;

    @Column(name = "short_desc_en", columnDefinition = "TEXT")
    private String shortDescEn;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "featured_image")
    private String featuredImage;

    @Column(name = "featured_image_url")
    private String featuredImageUrl;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(name = "views")
    private Integer views = 0;

    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, PENDING, SCHEDULED

    @Column(name = "language")
    private String language = "ta";

    @Column(name = "author_id")
    private Long authorId;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_breaking")
    private Boolean isBreaking = false;

    @Column(name = "breaking_order")
    private Integer breakingOrder;

    @Column(name = "is_slider")
    private Boolean isSlider = false;

    @Column(name = "is_recommended")
    private Boolean isRecommended = false;

    @Column(name = "show_only_registered")
    private Boolean showOnlyRegistered = false;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "optional_url")
    private String optionalUrl;

    @Column(name = "visibility")
    private Boolean visibility = true;

    @Column(name = "show_right_column")
    private Boolean showRightColumn = true;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();

    // --- Extended Post Types Support Columns ---
    @Column(name = "post_type")
    private String postType = "ARTICLE"; // ARTICLE, GALLERY, SORTED_LIST, VIDEO, AUDIO, TRIVIA_QUIZ, PERSONALITY_QUIZ

    @Column(name = "gallery_images", columnDefinition = "LONGTEXT")
    private String galleryImages;

    @Column(name = "sorted_list_items", columnDefinition = "LONGTEXT")
    private String sortedListItems;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_embed_code", columnDefinition = "TEXT")
    private String videoEmbedCode;

    @Column(name = "video_thumbnail_url")
    private String videoThumbnailUrl;

    @Column(name = "audio_tracks", columnDefinition = "LONGTEXT")
    private String audioTracks;

    @Column(name = "quiz_questions", columnDefinition = "LONGTEXT")
    private String quizQuestions;

    @Column(name = "files", columnDefinition = "LONGTEXT")
    private String files;

    @Column(name = "quiz_results", columnDefinition = "LONGTEXT")
    private String quizResults;

    // --- SEO & Google News Extension Fields ---
    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "focus_keywords")
    private String focusKeywords;

    @Column(unique = true)
    private String slug;

    @Column(name = "canonical_url")
    private String canonicalUrl;

    @Column(name = "author_name")
    private String authorName = "Kings TV News Desk";

    @Column(name = "seo_status")
    private String seoStatus = "ready";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // --- GPS Location Visibility ---
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "visibility_radius_km")
    private Double visibilityRadiusKm;

    @Column(name = "telegram_sent")
    private Boolean telegramSent = false;

    @Column(name = "reading_time")
    private Integer readingTime = 1;

    @Transient
    private String authorProfileImage;

    @Transient
    private String structuredDataJson;

    @PrePersist
    protected void onCreate() {
        this.publishedAt = this.publishedAt != null ? this.publishedAt : LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.readingTime = calculateReadingTime();
        syncCompatibilityFields();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.readingTime = calculateReadingTime();
        syncCompatibilityFields();
    }

    private void syncCompatibilityFields() {
        if (this.title != null) {
            if ("ta".equalsIgnoreCase(this.language)) {
                this.titleTa = this.title;
            } else {
                this.titleEn = this.title;
            }
        } else {
            this.title = "en".equalsIgnoreCase(this.language) ? this.titleEn : this.titleTa;
        }

        if (this.summary != null) {
            if ("ta".equalsIgnoreCase(this.language)) {
                this.shortDescTa = this.summary;
            } else {
                this.shortDescEn = this.summary;
            }
        } else {
            this.summary = "en".equalsIgnoreCase(this.language) ? this.shortDescEn : this.shortDescTa;
        }

        if (this.content != null) {
            if ("ta".equalsIgnoreCase(this.language)) {
                this.contentTa = this.content;
            } else {
                this.contentEn = this.content;
            }
        } else {
            this.content = "en".equalsIgnoreCase(this.language) ? this.contentEn : this.contentTa;
        }

        if (this.featuredImageUrl != null) {
            this.imageUrl = this.featuredImageUrl;
            this.featuredImage = this.featuredImageUrl;
        } else if (this.imageUrl != null) {
            this.featuredImageUrl = this.imageUrl;
            this.featuredImage = this.imageUrl;
        } else if (this.featuredImage != null) {
            this.featuredImageUrl = this.featuredImage;
            this.imageUrl = this.featuredImage;
        }

        if (this.views != null) {
            this.viewsCount = this.views;
        } else if (this.viewsCount != null) {
            this.views = this.viewsCount;
        }
    }

    private int calculateReadingTime() {
        int words = 0;
        String activeContent = "en".equalsIgnoreCase(this.language) ? this.contentEn : this.contentTa;
        if (activeContent == null) {
            activeContent = this.content;
        }
        if (activeContent != null && !activeContent.trim().isEmpty()) {
            words = activeContent.trim().split("\\s+").length;
        }
        double time = "en".equalsIgnoreCase(this.language) ? (words / 200.0) : (words / 130.0);
        return Math.max(1, (int) Math.ceil(time));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
    public Long getDistrictId() { return districtId; }
    public void setDistrictId(Long districtId) { this.districtId = districtId; }
    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }

    public String getTitleTa() { return titleTa; }
    public void setTitleTa(String titleTa) { this.titleTa = titleTa; }
    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }
    public String getTitle() { return title != null ? title : ("en".equalsIgnoreCase(language) ? titleEn : titleTa); }
    public void setTitle(String title) {
        this.title = title;
        if ("en".equalsIgnoreCase(this.language)) {
            this.titleEn = title;
        } else {
            this.titleTa = title;
        }
    }

    public String getContentTa() { return contentTa; }
    public void setContentTa(String contentTa) { this.contentTa = contentTa; }
    public String getContentEn() { return contentEn; }
    public void setContentEn(String contentEn) { this.contentEn = contentEn; }
    public String getContent() { return content != null ? content : ("en".equalsIgnoreCase(language) ? contentEn : contentTa); }
    public void setContent(String content) {
        this.content = content;
        if ("en".equalsIgnoreCase(this.language)) {
            this.contentEn = content;
        } else {
            this.contentTa = content;
        }
    }

    public String getShortDescTa() { return shortDescTa; }
    public void setShortDescTa(String shortDescTa) { this.shortDescTa = shortDescTa; }
    public String getShortDescEn() { return shortDescEn; }
    public void setShortDescEn(String shortDescEn) { this.shortDescEn = shortDescEn; }
    public String getSummary() { return summary != null ? summary : ("en".equalsIgnoreCase(language) ? shortDescEn : shortDescTa); }
    public void setSummary(String summary) {
        this.summary = summary;
        if ("en".equalsIgnoreCase(this.language)) {
            this.shortDescEn = summary;
        } else {
            this.shortDescTa = summary;
        }
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getFeaturedImage() { return featuredImage; }
    public void setFeaturedImage(String featuredImage) { this.featuredImage = featuredImage; }
    public String getFeaturedImageUrl() { return featuredImageUrl != null ? featuredImageUrl : imageUrl; }
    public void setFeaturedImageUrl(String featuredImageUrl) {
        this.featuredImageUrl = featuredImageUrl;
        this.imageUrl = featuredImageUrl;
        this.featuredImage = featuredImageUrl;
    }

    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }
    public Integer getViews() { return views != null ? views : viewsCount; }
    public void setViews(Integer views) {
        this.views = views;
        this.viewsCount = views;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public Boolean getIsFeatured() { return isFeatured != null && isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public Boolean getIsBreaking() { return isBreaking != null && isBreaking; }
    public void setIsBreaking(Boolean isBreaking) { this.isBreaking = isBreaking; }
    public Boolean getIsSlider() { return isSlider != null && isSlider; }
    public void setIsSlider(Boolean isSlider) { this.isSlider = isSlider; }
    public Boolean getIsRecommended() { return isRecommended != null && isRecommended; }
    public void setIsRecommended(Boolean isRecommended) { this.isRecommended = isRecommended; }
    public Boolean getShowOnlyRegistered() { return showOnlyRegistered != null && showOnlyRegistered; }
    public void setShowOnlyRegistered(Boolean showOnlyRegistered) { this.showOnlyRegistered = showOnlyRegistered; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getOptionalUrl() { return optionalUrl; }
    public void setOptionalUrl(String optionalUrl) { this.optionalUrl = optionalUrl; }
    public Boolean getVisibility() { return visibility != null && visibility; }
    public void setVisibility(Boolean visibility) { this.visibility = visibility; }
    public Boolean getShowRightColumn() { return showRightColumn != null && showRightColumn; }
    public void setShowRightColumn(Boolean showRightColumn) { this.showRightColumn = showRightColumn; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    // --- Extended Post Types Getters & Setters ---
    public String getPostType() { return postType; }
    public void setPostType(String postType) { this.postType = postType; }

    public String getGalleryImages() { return galleryImages; }
    public void setGalleryImages(String galleryImages) { this.galleryImages = galleryImages; }

    public String getSortedListItems() { return sortedListItems; }
    public void setSortedListItems(String sortedListItems) { this.sortedListItems = sortedListItems; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getVideoEmbedCode() { return videoEmbedCode; }
    public void setVideoEmbedCode(String videoEmbedCode) { this.videoEmbedCode = videoEmbedCode; }

    public String getVideoThumbnailUrl() { return videoThumbnailUrl; }
    public void setVideoThumbnailUrl(String videoThumbnailUrl) { this.videoThumbnailUrl = videoThumbnailUrl; }

    public String getAudioTracks() { return audioTracks; }
    public void setAudioTracks(String audioTracks) { this.audioTracks = audioTracks; }

    public String getQuizQuestions() { return quizQuestions; }
    public void setQuizQuestions(String quizQuestions) { this.quizQuestions = quizQuestions; }

    public String getFiles() { return files; }
    public void setFiles(String files) { this.files = files; }

    public String getQuizResults() { return quizResults; }
    public void setQuizResults(String quizResults) { this.quizResults = quizResults; }

    // SEO Getters/Setters
    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }
    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }
    public String getMetaKeywords() { return metaKeywords; }
    public void setMetaKeywords(String metaKeywords) { this.metaKeywords = metaKeywords; }
    public String getFocusKeywords() { return focusKeywords; }
    public void setFocusKeywords(String focusKeywords) { this.focusKeywords = focusKeywords; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getSeoStatus() { return seoStatus; }
    public void setSeoStatus(String seoStatus) { this.seoStatus = seoStatus; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getVisibilityRadiusKm() { return visibilityRadiusKm; }
    public void setVisibilityRadiusKm(Double visibilityRadiusKm) { this.visibilityRadiusKm = visibilityRadiusKm; }

    public String getStructuredDataJson() { return structuredDataJson; }
    public void setStructuredDataJson(String structuredDataJson) { this.structuredDataJson = structuredDataJson; }
    public Integer getReadingTime() { return readingTime; }
    public void setReadingTime(Integer readingTime) { this.readingTime = readingTime; }
    public String getAuthorProfileImage() { return authorProfileImage; }
    public void setAuthorProfileImage(String authorProfileImage) { this.authorProfileImage = authorProfileImage; }
    public Boolean getTelegramSent() { return telegramSent != null && telegramSent; }
    public void setTelegramSent(Boolean telegramSent) { this.telegramSent = telegramSent; }

    public Integer getBreakingOrder() { return breakingOrder; }
    public void setBreakingOrder(Integer breakingOrder) { this.breakingOrder = breakingOrder; }
}
