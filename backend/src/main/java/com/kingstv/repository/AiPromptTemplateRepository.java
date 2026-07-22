package com.kingstv.repository;

import com.kingstv.models.AiPromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiPromptTemplateRepository extends JpaRepository<AiPromptTemplate, Long> {
    Optional<AiPromptTemplate> findByFeature(String feature);
    Optional<AiPromptTemplate> findByFeatureAndIsActiveTrue(String feature);
}
