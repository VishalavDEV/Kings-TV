package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "ad_slots")
public class AdSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String placement; // header, sidebar, in-article, footer, popup

    @Column(nullable = false)
    private String dimensions; // e.g. "728x90"

    @Column(name = "max_concurrent_ads")
    private Integer maxConcurrentAds = 1;

    public AdSlot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlacement() { return placement; }
    public void setPlacement(String placement) { this.placement = placement; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public Integer getMaxConcurrentAds() { return maxConcurrentAds; }
    public void setMaxConcurrentAds(Integer maxConcurrentAds) { this.maxConcurrentAds = maxConcurrentAds; }
}
