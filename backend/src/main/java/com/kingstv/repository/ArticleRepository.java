package com.kingstv.repository;

import com.kingstv.models.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {
    List<Article> findByStatusOrderByPublishedAtDesc(String status);
    List<Article> findTop50ByStatusOrderByPublishedAtDesc(String status);
    Optional<Article> findBySlug(String slug);
    org.springframework.data.domain.Page<Article> findByStatus(String status, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT * FROM articles WHERE status = 'published' AND (" +
           "latitude IS NULL OR longitude IS NULL OR visibility_radius_km IS NULL OR " +
           "(6371 * acos(cos(radians(:userLat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:userLon)) + " +
           "sin(radians(:userLat)) * sin(radians(latitude)))) <= visibility_radius_km) " +
           "ORDER BY published_at DESC LIMIT :limit", nativeQuery = true)
    List<Article> findNearbyArticles(@Param("userLat") Double userLat, @Param("userLon") Double userLon, @Param("limit") int limit);
}
