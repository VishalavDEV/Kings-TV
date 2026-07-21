package com.kingstv.repository;

import com.kingstv.models.AuthorEarning;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AuthorEarningRepository extends JpaRepository<AuthorEarning, Long> {

    Optional<AuthorEarning> findByArticleIdAndEarnDate(Long articleId, LocalDate earnDate);

    Page<AuthorEarning> findAllByOrderByEarnDateDesc(Pageable pageable);

    Page<AuthorEarning> findByAuthorIdOrderByEarnDateDesc(Long authorId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(ae.earningsAmount), 0) FROM AuthorEarning ae WHERE (:authorId IS NULL OR ae.authorId = :authorId)")
    java.math.BigDecimal sumEarnings(@Param("authorId") Long authorId);
}
