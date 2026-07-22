package com.kingstv.repository;

import com.kingstv.models.PageVersionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PageVersionHistoryRepository extends JpaRepository<PageVersionHistory, Long> {
    List<PageVersionHistory> findByPageIdOrderByVersionDesc(Long pageId);
}
