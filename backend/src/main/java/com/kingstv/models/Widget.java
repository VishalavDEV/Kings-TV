package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "widgets")
public class Widget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "widget_type", nullable = false)
    private String widgetType; // Recent Posts, Categories, Tags Cloud, Custom HTML

    @Column(nullable = false)
    private String title;

    @Column(name = "config", columnDefinition = "TEXT")
    private String config; // JSON payload string mapping widget settings

    @Column(name = "placement")
    private String placement = "sidebar"; // sidebar, footer

    @Column(name = "menu_order")
    private Integer menuOrder = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWidgetType() { return widgetType; }
    public void setWidgetType(String widgetType) { this.widgetType = widgetType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getConfig() { return config; }
    public void setConfig(String config) { this.config = config; }

    public String getPlacement() { return placement; }
    public void setPlacement(String placement) { this.placement = placement; }

    public Integer getMenuOrder() { return menuOrder; }
    public void setMenuOrder(Integer menuOrder) { this.menuOrder = menuOrder; }
}
