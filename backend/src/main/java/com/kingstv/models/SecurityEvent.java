package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_events", indexes = {
    @Index(name = "idx_security_user", columnList = "admin_user_id"),
    @Index(name = "idx_security_type", columnList = "event_type"),
    @Index(name = "idx_security_created", columnList = "created_at")
})
public class SecurityEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType; // permission_denied, suspicious_login, password_changed, role_changed, token_revoked

    @Column(nullable = false, length = 20)
    private String severity; // low, medium, high

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SecurityEvent() {}

    public SecurityEvent(String eventType, String severity, String details, Long adminUserId, String ipAddress) {
        this.eventType = eventType;
        this.severity = severity;
        this.details = details;
        this.adminUserId = adminUserId;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Long getAdminUserId() { return adminUserId; }
    public void setAdminUserId(Long adminUserId) { this.adminUserId = adminUserId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
