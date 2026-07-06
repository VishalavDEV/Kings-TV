package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "classified_listings")
public class ClassifiedListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "classified_id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(name = "price_detail", nullable = false)
    private String priceDetail;

    @Column(nullable = false)
    private String location;

    @Column(name = "contact_info", nullable = false)
    private String contactInfo;

    @Column(columnDefinition = "TEXT")
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriceDetail() { return priceDetail; }
    public void setPriceDetail(String priceDetail) { this.priceDetail = priceDetail; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
