package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ad_spaces")
public class AdSpace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique placement identifier: header, sidebar, footer, in_article,
     * before_content, after_content, popup, etc.
     */
    @Column(name = "placement_key", nullable = false, unique = true)
    private String placementKey;

    @Column(name = "placement_label")
    private String placementLabel;

    /** Raw HTML/JS ad code (e.g. Google AdSense script block) */
    @Column(name = "ad_code", columnDefinition = "TEXT")
    private String adCode;

    /** Direct image-based ad: image URL */
    @Column(name = "ad_image_url")
    private String adImageUrl;

    /** Direct image-based ad: click destination URL */
    @Column(name = "ad_url")
    private String adUrl;

    /** Google AdSense site-level activation / verification code */
    @Column(name = "adsense_activation_code", columnDefinition = "TEXT")
    private String adsenseActivationCode;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlacementKey() { return placementKey; }
    public void setPlacementKey(String placementKey) { this.placementKey = placementKey; }

    public String getPlacementLabel() { return placementLabel; }
    public void setPlacementLabel(String placementLabel) { this.placementLabel = placementLabel; }

    public String getAdCode() { return adCode; }
    public void setAdCode(String adCode) { this.adCode = adCode; }

    public String getAdImageUrl() { return adImageUrl; }
    public void setAdImageUrl(String adImageUrl) { this.adImageUrl = adImageUrl; }

    public String getAdUrl() { return adUrl; }
    public void setAdUrl(String adUrl) { this.adUrl = adUrl; }

    public String getAdsenseActivationCode() { return adsenseActivationCode; }
    public void setAdsenseActivationCode(String adsenseActivationCode) { this.adsenseActivationCode = adsenseActivationCode; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
