package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "advertiser_id", nullable = false)
    private Advertiser advertiser;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    private Double budget;

    @Column(nullable = false)
    private String status = "draft"; // draft, active, paused, completed

    @Column(name = "target_pages_categories", columnDefinition = "TEXT")
    private String targetPagesCategories; // JSON targeting

    public Campaign() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Advertiser getAdvertiser() { return advertiser; }
    public void setAdvertiser(Advertiser advertiser) { this.advertiser = advertiser; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTargetPagesCategories() { return targetPagesCategories; }
    public void setTargetPagesCategories(String targetPagesCategories) { this.targetPagesCategories = targetPagesCategories; }
}
