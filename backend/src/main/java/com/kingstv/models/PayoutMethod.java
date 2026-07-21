package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "payout_methods")
public class PayoutMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "method_name", nullable = false, unique = true)
    private String methodName; // PayPal, IBAN, SWIFT, UPI, Bank Transfer

    @Column(nullable = false)
    private Boolean enabled = false;

    @Column(name = "account_details", columnDefinition = "TEXT")
    private String accountDetails;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getAccountDetails() { return accountDetails; }
    public void setAccountDetails(String accountDetails) { this.accountDetails = accountDetails; }
}
