package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "local_obituaries")
public class Obituary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "obit_id")
    private Long id;

    @Column(name = "deceased_name", nullable = false)
    private String deceasedName;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String location;

    @Column(name = "demise_date", nullable = false)
    private LocalDate demiseDate;

    @Column(name = "funeral_details", nullable = false, columnDefinition = "TEXT")
    private String funeralDetails;

    @Column(name = "short_description", nullable = false, columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "tribute_count")
    private Integer tributeCount = 0;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "published";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeceasedName() { return deceasedName; }
    public void setDeceasedName(String deceasedName) { this.deceasedName = deceasedName; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDate getDemiseDate() { return demiseDate; }
    public void setDemiseDate(LocalDate demiseDate) { this.demiseDate = demiseDate; }
    public String getFuneralDetails() { return funeralDetails; }
    public void setFuneralDetails(String funeralDetails) { this.funeralDetails = funeralDetails; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public Integer getTributeCount() { return tributeCount; }
    public void setTributeCount(Integer tributeCount) { this.tributeCount = tributeCount; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
