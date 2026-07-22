package com.kingstv.repository;

import com.kingstv.models.Ad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {
    
    @Query("SELECT a FROM Ad a WHERE a.adSlot.placement = :placement " +
           "AND a.status = 'active' " +
           "AND a.campaign.status = 'active' " +
           "AND (a.campaign.startDate IS NULL OR a.campaign.startDate <= :now) " +
           "AND (a.campaign.endDate IS NULL OR a.campaign.endDate >= :now) " +
           "AND (a.startDate IS NULL OR a.startDate <= :now) " +
           "AND (a.endDate IS NULL OR a.endDate >= :now)")
    List<Ad> findActiveAdsForPlacement(@Param("placement") String placement, @Param("now") LocalDateTime now);
    
    List<Ad> findByCampaignId(Long campaignId);
    
    List<Ad> findByType(String type);
}
