package com.kingstv.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_logs", indexes = {
    @Index(name = "idx_apilog_status", columnList = "status_code"),
    @Index(name = "idx_apilog_method", columnList = "method"),
    @Index(name = "idx_apilog_created", columnList = "created_at")
})
public class ApiLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String endpoint;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(name = "status_code", nullable = false)
    private int statusCode;

    @Column(name = "response_time_ms", nullable = false)
    private long responseTimeMs;

    @Column(name = "caller_type", nullable = false, length = 50)
    private String callerType; // admin, public, system

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ApiLog() {}

    public ApiLog(String endpoint, String method, int statusCode, long responseTimeMs, String callerType) {
        this.endpoint = endpoint;
        this.method = method;
        this.statusCode = statusCode;
        this.responseTimeMs = responseTimeMs;
        this.callerType = callerType;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public int getStatusCode() { return statusCode; }
    public void setStatusCode(int statusCode) { this.statusCode = statusCode; }

    public long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(long responseTimeMs) { this.responseTimeMs = responseTimeMs; }

    public String getCallerType() { return callerType; }
    public void setCallerType(String callerType) { this.callerType = callerType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
