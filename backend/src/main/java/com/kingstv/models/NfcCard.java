package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nfc_cards")
public class NfcCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "listing_id")
    private Long listingId;

    @Column(name = "short_code", unique = true)
    private String shortCode;

    @Column(name = "link_type", nullable = false)
    private String linkType = "profile"; // payment, profile

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "is_payment_enabled")
    private Boolean isPaymentEnabled = false;

    @Column(name = "card_status", nullable = false)
    private String cardStatus = "requested"; // requested, printing, shipped, activated, blocked, reissued

    @Column(name = "upi_name")
    private String upiName;

    @Column(name = "otp_hash")
    private String otpHash;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "card_uid", unique = true)
    private String cardUid;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "title")
    private String title;

    @Column(name = "company")
    private String company;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinks;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(name = "card_template")
    private String cardTemplate = "classic";

    @Column(name = "vcard_enabled")
    private Boolean vcardEnabled = true;

    @Column(name = "tap_count")
    private Integer tapCount = 0;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public String getLinkType() { return linkType; }
    public void setLinkType(String linkType) { this.linkType = linkType; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public Boolean getIsPaymentEnabled() { return isPaymentEnabled; }
    public void setIsPaymentEnabled(Boolean isPaymentEnabled) { this.isPaymentEnabled = isPaymentEnabled; }

    public String getCardStatus() { return cardStatus; }
    public void setCardStatus(String cardStatus) { this.cardStatus = cardStatus; }

    public String getUpiName() { return upiName; }
    public void setUpiName(String upiName) { this.upiName = upiName; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCardUid() { return cardUid != null ? cardUid : shortCode; }
    public void setCardUid(String cardUid) { this.cardUid = cardUid; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getSocialLinks() { return socialLinks; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getCardTemplate() { return cardTemplate; }
    public void setCardTemplate(String cardTemplate) { this.cardTemplate = cardTemplate; }
    public Boolean getVcardEnabled() { return vcardEnabled; }
    public void setVcardEnabled(Boolean vcardEnabled) { this.vcardEnabled = vcardEnabled; }
    public Integer getTapCount() { return tapCount; }
    public void setTapCount(Integer tapCount) { this.tapCount = tapCount; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
