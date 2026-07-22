package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ads")
public class Ad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ad_slot_id", nullable = false)
    private AdSlot adSlot;

    @Column(nullable = false)
    private String type; // banner, sidebar, popup

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "html_code", columnDefinition = "TEXT")
    private String htmlCode;

    @Column(name = "click_url", length = 1024)
    private String clickUrl;

    @Column(nullable = false)
    private String status = "active"; // active, paused

    private Integer impressions = 0;
    private Integer clicks = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Popup-specific fields
    @Column(name = "display_frequency")
    private String displayFrequency; // once per session, every visit

    @Column(name = "delay_seconds")
    private Integer delaySeconds = 0;

    @Column(name = "close_button_required")
    private Boolean closeButtonRequired = true;

    public Ad() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Campaign getCampaign() { return campaign; }
    public void setCampaign(Campaign campaign) { this.campaign = campaign; }

    public AdSlot getAdSlot() { return adSlot; }
    public void setAdSlot(AdSlot adSlot) { this.adSlot = adSlot; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getHtmlCode() { return htmlCode; }
    public void setHtmlCode(String htmlCode) { this.htmlCode = htmlCode; }

    public String getClickUrl() { return clickUrl; }
    public void setClickUrl(String clickUrl) { this.clickUrl = clickUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getImpressions() { return impressions; }
    public void setImpressions(Integer impressions) { this.impressions = impressions; }

    public Integer getClicks() { return clicks; }
    public void setClicks(Integer clicks) { this.clicks = clicks; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getDisplayFrequency() { return displayFrequency; }
    public void setDisplayFrequency(String displayFrequency) { this.displayFrequency = displayFrequency; }

    public Integer getDelaySeconds() { return delaySeconds; }
    public void setDelaySeconds(Integer delaySeconds) { this.delaySeconds = delaySeconds; }

    public Boolean getCloseButtonRequired() { return closeButtonRequired; }
    public void setCloseButtonRequired(Boolean closeButtonRequired) { this.closeButtonRequired = closeButtonRequired; }
}
