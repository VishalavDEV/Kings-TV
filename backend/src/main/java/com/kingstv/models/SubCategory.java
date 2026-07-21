package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sub_categories")
public class SubCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subcategory_id")
    private Long subcategoryId;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "parent_category_id")
    private Long parentCategoryId;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_ta")
    private String nameTa;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String language = "ta";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(length = 20)
    private String color = "#3B82F6";

    @Column(name = "menu_order")
    private Integer menuOrder = 0;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "show_on_menu")
    private Boolean showOnMenu = true;

    @Column(nullable = false)
    private String status = "active";

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }

    public Long getId() { return subcategoryId; }
    public void setId(Long id) { this.subcategoryId = id; }

    public Long getCategoryId() { return categoryId != null ? categoryId : parentCategoryId; }
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
        this.parentCategoryId = categoryId;
    }

    public Long getParentCategoryId() { return parentCategoryId != null ? parentCategoryId : categoryId; }
    public void setParentCategoryId(Long parentCategoryId) {
        this.parentCategoryId = parentCategoryId;
        this.categoryId = parentCategoryId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNameTa() { return nameTa != null ? nameTa : name; }
    public void setNameTa(String nameTa) { this.nameTa = nameTa; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getMenuOrder() { return menuOrder != null ? menuOrder : displayOrder; }
    public void setMenuOrder(Integer menuOrder) {
        this.menuOrder = menuOrder;
        this.displayOrder = menuOrder;
    }

    public Integer getDisplayOrder() { return displayOrder != null ? displayOrder : menuOrder; }
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
        this.menuOrder = displayOrder;
    }

    public Boolean getShowOnMenu() { return showOnMenu; }
    public void setShowOnMenu(Boolean showOnMenu) { this.showOnMenu = showOnMenu; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
