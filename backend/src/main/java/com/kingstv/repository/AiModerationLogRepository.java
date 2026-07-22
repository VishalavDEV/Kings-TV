package com.kingstv.repository;

import com.kingstv.models.AiModerationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiModerationLogRepository extends JpaRepository<AiModerationLog, Long> {
    Page<AiModerationLog> findByOrderByCreatedAtDesc(Pageable pageable);
    List<AiModerationLog> findByContentTypeAndContentId(String contentType, Long contentId);
}
