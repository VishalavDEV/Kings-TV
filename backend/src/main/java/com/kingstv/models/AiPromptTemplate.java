package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_prompt_templates")
public class AiPromptTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String feature; // rewriter, seo, sensor, moderation, suggestions

    @Column(name = "prompt_template", nullable = false, columnDefinition = "TEXT")
    private String promptTemplate;

    @Column(name = "model_name", nullable = false, length = 50)
    private String modelName = "gemini-2.0-flash";

    @Column(nullable = false)
    private Double temperature = 0.7;

    @Column(name = "max_tokens", nullable = false)
    private Integer maxTokens = 2000;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public AiPromptTemplate() {}

    public AiPromptTemplate(String feature, String promptTemplate, String modelName, Double temperature, Integer maxTokens) {
        this.feature = feature;
        this.promptTemplate = promptTemplate;
        this.modelName = modelName;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }
    public String getPromptTemplate() { return promptTemplate; }
    public void setPromptTemplate(String promptTemplate) { this.promptTemplate = promptTemplate; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Integer getMaxTokens() { return maxTokens; }
    public void setMaxTokens(Integer maxTokens) { this.maxTokens = maxTokens; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
