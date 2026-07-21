package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

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

    @Column(name = "icon")
    private String icon;

    @Column(name = "is_nav")
    private Boolean isNav = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getShowOnMenu() { return showOnMenu != null ? showOnMenu : isNav; }
    public void setShowOnMenu(Boolean showOnMenu) {
        this.showOnMenu = showOnMenu;
        this.isNav = showOnMenu;
    }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getIsNav() { return isNav != null ? isNav : showOnMenu; }
    public void setIsNav(Boolean isNav) {
        this.isNav = isNav;
        this.showOnMenu = isNav;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
