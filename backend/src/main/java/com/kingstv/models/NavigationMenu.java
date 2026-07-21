package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "navigation_menus")
public class NavigationMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "title_ta", nullable = false)
    private String titleTa;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "link_url", nullable = false)
    private String linkUrl;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "location")
    private String location = "MAIN_MENU"; // TOP_MENU, MAIN_MENU, FOOTER

    @Column(name = "dynamic_type", length = 50)
    private String dynamicType; // DISTRICTS | CONSTITUENCIES | null (static)

    @Column(name = "dynamic_district_id")
    private Long dynamicDistrictId; // For CONSTITUENCIES type, scope to specific district

    // Transient compatibility fields for the new Frontend API
    @Transient
    private String label;
    @Transient
    private String link;
    @Transient
    private Integer menuOrder;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getTitleTa() { return titleTa; }
    public void setTitleTa(String titleTa) {
        this.titleTa = titleTa;
        this.label = titleTa;
    }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) {
        this.titleEn = titleEn;
        if (titleTa == null) {
            this.label = titleEn;
        }
    }

    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
        this.link = linkUrl;
    }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
        this.menuOrder = displayOrder;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    // --- Dynamic Getter/Setter Aliases for label/link/menuOrder ---
    public String getLabel() {
        return label != null ? label : (titleEn != null && !titleEn.isEmpty() ? titleEn : titleTa);
    }
    public void setLabel(String label) {
        this.label = label;
        this.titleTa = label;
        this.titleEn = label;
    }

    public String getLink() {
        return link != null ? link : linkUrl;
    }
    public void setLink(String link) {
        this.link = link;
        this.linkUrl = link;
    }

    public Integer getMenuOrder() {
        return menuOrder != null ? menuOrder : displayOrder;
    }
    public void setMenuOrder(Integer menuOrder) {
        this.menuOrder = menuOrder;
        this.displayOrder = menuOrder;
    }

    public String getDynamicType() { return dynamicType; }
    public void setDynamicType(String dynamicType) { this.dynamicType = dynamicType; }

    public Long getDynamicDistrictId() { return dynamicDistrictId; }
    public void setDynamicDistrictId(Long dynamicDistrictId) { this.dynamicDistrictId = dynamicDistrictId; }
}

