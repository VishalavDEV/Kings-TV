package com.kingstv.repository;

import com.kingstv.models.LanguageTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageTranslationRepository extends JpaRepository<LanguageTranslation, Long> {
    List<LanguageTranslation> findByLanguageId(Long languageId);
    Optional<LanguageTranslation> findByLanguageIdAndTranslationKey(Long languageId, String translationKey);
    void deleteByLanguageId(Long languageId);
}
