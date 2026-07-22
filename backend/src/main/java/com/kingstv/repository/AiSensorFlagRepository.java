package com.kingstv.repository;

import com.kingstv.models.AiSensorFlag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiSensorFlagRepository extends JpaRepository<AiSensorFlag, Long> {
    Page<AiSensorFlag> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<AiSensorFlag> findByContentTypeAndContentId(String contentType, Long contentId);
}
