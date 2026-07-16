package com.kingstv.repository;

import com.kingstv.models.ContentEditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ContentEditLogRepository extends JpaRepository<ContentEditLog, Long> {
    Optional<ContentEditLog> findByContentTypeAndContentId(String contentType, Long contentId);
}
