package com.kingstv.repository;

import com.kingstv.models.AdEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdEventRepository extends JpaRepository<AdEvent, Long> {
    
    @Query("SELECT e.eventType, COUNT(e.id) FROM AdEvent e WHERE e.adId = :adId AND e.timestamp BETWEEN :start AND :end GROUP BY e.eventType")
    List<Object[]> countEventsForAd(@Param("adId") Long adId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e.id) FROM AdEvent e JOIN Ad a ON e.adId = a.id WHERE a.campaign.id = :campaignId AND e.timestamp BETWEEN :start AND :end GROUP BY e.eventType")
    List<Object[]> countEventsForCampaign(@Param("campaignId") Long campaignId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e.eventType, COUNT(e.id) FROM AdEvent e JOIN Ad a ON e.adId = a.id WHERE a.campaign.advertiser.id = :advertiserId AND e.timestamp BETWEEN :start AND :end GROUP BY e.eventType")
    List<Object[]> countEventsForAdvertiser(@Param("advertiserId") Long advertiserId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(e.timestamp) as dateVal, e.eventType, COUNT(e.id) FROM AdEvent e WHERE e.timestamp BETWEEN :start AND :end GROUP BY DATE(e.timestamp), e.eventType")
    List<Object[]> findDailyTrendData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT DATE(e.timestamp) as dateVal, e.eventType, COUNT(e.id) FROM AdEvent e JOIN Ad a ON e.adId = a.id WHERE a.campaign.id = :campaignId AND e.timestamp BETWEEN :start AND :end GROUP BY DATE(e.timestamp), e.eventType")
    List<Object[]> findDailyTrendDataForCampaign(@Param("campaignId") Long campaignId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
