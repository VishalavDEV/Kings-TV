package com.kingstv.repository;

import com.kingstv.models.CustomPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomPageRepository extends JpaRepository<CustomPage, Long> {
    Optional<CustomPage> findBySlug(String slug);
    boolean existsBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
    List<CustomPage> findByLanguageOrderByMenuOrderAsc(String language);
    boolean existsBySlugIgnoreCaseAndLanguage(String slug, String language);
    boolean existsBySlugIgnoreCaseAndLanguageAndIdNot(String slug, String language, Long id);
    List<CustomPage> findByVisibility(String visibility);
}
