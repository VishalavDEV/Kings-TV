package com.kingstv.repository;

import com.kingstv.models.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long>, JpaSpecificationExecutor<SubCategory> {
    Optional<SubCategory> findBySlug(String slug);
    List<SubCategory> findByCategoryIdAndStatusOrderByDisplayOrderAsc(Long categoryId, String status);
    List<SubCategory> findByStatusOrderByDisplayOrderAsc(String status);
    List<SubCategory> findByCategoryId(Long categoryId);

    boolean existsByNameAndLanguageAndCategoryId(String name, String language, Long categoryId);
    boolean existsByNameAndLanguageAndCategoryIdAndSubcategoryIdNot(String name, String language, Long categoryId, Long subcategoryId);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndSubcategoryIdNot(String slug, Long subcategoryId);
    boolean existsByCategoryId(Long categoryId);
    boolean existsBySlugAndLanguage(String slug, String language);
    boolean existsBySlugAndLanguageAndSubcategoryIdNot(String slug, String language, Long subcategoryId);
}
