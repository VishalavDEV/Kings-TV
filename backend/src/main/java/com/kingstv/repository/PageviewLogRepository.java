package com.kingstv.repository;

import com.kingstv.models.PageviewLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PageviewLogRepository extends JpaRepository<PageviewLog, Long> {

    Page<PageviewLog> findAllByOrderByViewedAtDesc(Pageable pageable);

    Page<PageviewLog> findByArticleIdOrderByViewedAtDesc(Long articleId, Pageable pageable);

    Page<PageviewLog> findByAuthorIdOrderByViewedAtDesc(Long authorId, Pageable pageable);

    @Query("SELECT p FROM PageviewLog p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " CAST(p.articleId AS string) LIKE %:search% OR " +
           " p.authorName LIKE %:search% OR " +
           " p.ipAddress LIKE %:search%) " +
           "ORDER BY p.viewedAt DESC")
    Page<PageviewLog> searchPageviews(@Param("search") String search, Pageable pageable);
}
