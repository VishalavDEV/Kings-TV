package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity", indexes = {
    @Index(name = "idx_activity_user", columnList = "admin_user_id"),
    @Index(name = "idx_activity_created", columnList = "created_at")
})
public class UserActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_user_id", nullable = false)
    private Long adminUserId;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType; // page_view, action

    @Column(name = "page_or_endpoint", nullable = false, length = 255)
    private String pageOrEndpoint; // GET /api/admin/advertisers

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UserActivity() {}

    public UserActivity(Long adminUserId, String activityType, String pageOrEndpoint) {
        this.adminUserId = adminUserId;
        this.activityType = activityType;
        this.pageOrEndpoint = pageOrEndpoint;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAdminUserId() { return adminUserId; }
    public void setAdminUserId(Long adminUserId) { this.adminUserId = adminUserId; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getPageOrEndpoint() { return pageOrEndpoint; }
    public void setPageOrEndpoint(String pageOrEndpoint) { this.pageOrEndpoint = pageOrEndpoint; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
