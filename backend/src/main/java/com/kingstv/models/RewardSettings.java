package com.kingstv.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_settings")
public class RewardSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ENABLED or DISABLED */
    @Column(nullable = false)
    private String status = "ENABLED";

    @Column(name = "reward_amount_per_1000_views", nullable = false, precision = 10, scale = 4)
    private BigDecimal rewardAmountPer1000Views = BigDecimal.valueOf(1.00);

    @Column(name = "currency_name", nullable = false)
    private String currencyName = "Indian Rupee";

    @Column(name = "currency_symbol", nullable = false)
    private String currencySymbol = "₹";

    /** e.g. "1,234.56" or "1.234,56" */
    @Column(name = "currency_format", nullable = false)
    private String currencyFormat = "1,234.56";

    /** BEFORE or AFTER */
    @Column(name = "symbol_position", nullable = false)
    private String symbolPosition = "BEFORE";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getRewardAmountPer1000Views() { return rewardAmountPer1000Views; }
    public void setRewardAmountPer1000Views(BigDecimal rewardAmountPer1000Views) { this.rewardAmountPer1000Views = rewardAmountPer1000Views; }

    public String getCurrencyName() { return currencyName; }
    public void setCurrencyName(String currencyName) { this.currencyName = currencyName; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getCurrencyFormat() { return currencyFormat; }
    public void setCurrencyFormat(String currencyFormat) { this.currencyFormat = currencyFormat; }

    public String getSymbolPosition() { return symbolPosition; }
    public void setSymbolPosition(String symbolPosition) { this.symbolPosition = symbolPosition; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
