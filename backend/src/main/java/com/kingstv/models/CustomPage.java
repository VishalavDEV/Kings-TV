package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_pages")
public class CustomPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "keywords")
    private String keywords;

    @Column(name = "language")
    private String language = "ta";

    @Column(name = "parent_link_id")
    private Long parentLinkId;

    @Column(name = "menu_order")
    private Integer menuOrder = 0;

    @Column(name = "location")
    private String location = "NONE"; // TOP_MENU, MAIN_MENU, FOOTER, NONE

    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "visibility")
    private String visibility = "Public"; // Public, Draft

    @Column(name = "page_type")
    private String pageType = "standard"; // standard, about_us, contact, career, privacy_policy, terms_of_use

    // --- Structured Custom Fields ---
    @Column(name = "team_members", columnDefinition = "TEXT")
    private String teamMembers; // JSON string array of name/photo/title/bio

    @Column(name = "milestones", columnDefinition = "TEXT")
    private String milestones; // JSON string array of timeline milestones

    @Column(name = "phone_numbers", columnDefinition = "TEXT")
    private String phoneNumbers; // JSON string array of phone numbers

    @Column(name = "email_addresses", columnDefinition = "TEXT")
    private String emailAddresses; // JSON string array of email addresses

    @Column(name = "office_hours", columnDefinition = "TEXT")
    private String officeHours;

    @Column(name = "embedded_map", columnDefinition = "TEXT")
    private String embeddedMap;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;

    // --- Timestamps ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.effectiveDate == null) {
            this.effectiveDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Long getParentLinkId() { return parentLinkId; }
    public void setParentLinkId(Long parentLinkId) { this.parentLinkId = parentLinkId; }

    public Integer getMenuOrder() { return menuOrder; }
    public void setMenuOrder(Integer menuOrder) { this.menuOrder = menuOrder; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getVisibility() { return visibility != null ? visibility : "Public"; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getPageType() { return pageType != null ? pageType : "standard"; }
    public void setPageType(String pageType) { this.pageType = pageType; }

    // --- Structured Custom Fields Getters/Setters ---
    public String getTeamMembers() { return teamMembers; }
    public void setTeamMembers(String teamMembers) { this.teamMembers = teamMembers; }

    public String getMilestones() { return milestones; }
    public void setMilestones(String milestones) { this.milestones = milestones; }

    public String getPhoneNumbers() { return phoneNumbers; }
    public void setPhoneNumbers(String phoneNumbers) { this.phoneNumbers = phoneNumbers; }

    public String getEmailAddresses() { return emailAddresses; }
    public void setEmailAddresses(String emailAddresses) { this.emailAddresses = emailAddresses; }

    public String getOfficeHours() { return officeHours; }
    public void setOfficeHours(String officeHours) { this.officeHours = officeHours; }

    public String getEmbeddedMap() { return embeddedMap; }
    public void setEmbeddedMap(String embeddedMap) { this.embeddedMap = embeddedMap; }

    public Integer getVersion() { return version != null ? version : 1; }
    public void setVersion(Integer version) { this.version = version; }

    public LocalDateTime getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDateTime effectiveDate) { this.effectiveDate = effectiveDate; }

    // --- Timestamps Getters/Setters ---
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
