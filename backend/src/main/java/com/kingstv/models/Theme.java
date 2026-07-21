package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "themes")
public class Theme {
    @Id
    private String id; // theme-default, theme-dark, theme-red, theme-green

    @Column(nullable = false)
    private String name;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "is_active")
    private Boolean isActive = false;

    public Theme() {}

    public Theme(String id, String name, String thumbnailUrl, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.thumbnailUrl = thumbnailUrl;
        this.isActive = isActive;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public Boolean getIsActive() { return isActive != null && isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
