package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "language_translations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"language_id", "translation_key"})
})
public class LanguageTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "language_id", nullable = false)
    private Long languageId;

    @Column(name = "translation_key", nullable = false)
    private String translationKey;

    @Column(name = "translation_value", columnDefinition = "TEXT")
    private String translationValue;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLanguageId() { return languageId; }
    public void setLanguageId(Long languageId) { this.languageId = languageId; }

    public String getTranslationKey() { return translationKey; }
    public void setTranslationKey(String translationKey) { this.translationKey = translationKey; }

    public String getTranslationValue() { return translationValue; }
    public void setTranslationValue(String translationValue) { this.translationValue = translationValue; }
}
