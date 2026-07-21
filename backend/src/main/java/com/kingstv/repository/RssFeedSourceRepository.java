package com.kingstv.repository;

import com.kingstv.models.RssFeedSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RssFeedSourceRepository extends JpaRepository<RssFeedSource, Long> {
    List<RssFeedSource> findByIsActiveTrue();
    List<RssFeedSource> findByAutoImportEnabledTrueAndIsActiveTrue();
    boolean existsBySourceUrl(String sourceUrl);
}
