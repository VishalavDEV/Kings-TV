package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminAdController {

    @Autowired
    private AdvertiserRepository advertiserRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private AdSlotRepository adSlotRepository;

    @Autowired
    private AdRepository adRepository;

    @Autowired
    private AdEventRepository adEventRepository;

    // ==========================================
    // ADVERTISERS CRUD
    // ==========================================

    @GetMapping("/advertisers")
    public ResponseEntity<?> getAllAdvertisers() {
        List<Advertiser> advertisers = advertiserRepository.findAll();
        List<Map<String, Object>> response = advertisers.stream().map(adv -> {
            long activeCampaigns = campaignRepository.countByAdvertiserIdAndStatus(adv.getId(), "active");
            Map<String, Object> map = new HashMap<>();
            map.put("id", adv.getId());
            map.put("companyName", adv.getCompanyName());
            map.put("contactEmail", adv.getContactEmail());
            map.put("contactPhone", adv.getContactPhone());
            map.put("status", adv.getStatus());
            map.put("createdAt", adv.getCreatedAt());
            map.put("activeCampaignsCount", activeCampaigns);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/advertisers/{id}")
    public ResponseEntity<?> getAdvertiserById(@PathVariable Long id) {
        return advertiserRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/advertisers")
    public ResponseEntity<?> createAdvertiser(@RequestBody Advertiser advertiser) {
        advertiser.setCreatedAt(LocalDateTime.now());
        Advertiser saved = advertiserRepository.save(advertiser);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/advertisers/{id}")
    public ResponseEntity<?> updateAdvertiser(@PathVariable Long id, @RequestBody Advertiser payload) {
        return advertiserRepository.findById(id).map(adv -> {
            adv.setCompanyName(payload.getCompanyName());
            adv.setContactEmail(payload.getContactEmail());
            adv.setContactPhone(payload.getContactPhone());
            adv.setStatus(payload.getStatus());
            Advertiser saved = advertiserRepository.save(adv);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/advertisers/{id}")
    public ResponseEntity<?> deleteAdvertiser(@PathVariable Long id) {
        return advertiserRepository.findById(id).map(adv -> {
            adv.setStatus("inactive");
            advertiserRepository.save(adv);
            return ResponseEntity.ok(Map.of("message", "Advertiser deactivated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // CAMPAIGNS CRUD
    // ==========================================

    @GetMapping("/campaigns")
    public ResponseEntity<?> getAllCampaigns() {
        return ResponseEntity.ok(campaignRepository.findAll());
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<?> getCampaignById(@PathVariable Long id) {
        Optional<Campaign> campaignOpt = campaignRepository.findById(id);
        if (campaignOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Campaign campaign = campaignOpt.get();
        List<Ad> ads = adRepository.findByCampaignId(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("campaign", campaign);
        response.put("ads", ads);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<?> createCampaign(@RequestBody Campaign campaign) {
        // Resolve advertiser to ensure FK constraints
        if (campaign.getAdvertiser() != null && campaign.getAdvertiser().getId() != null) {
            Optional<Advertiser> advOpt = advertiserRepository.findById(campaign.getAdvertiser().getId());
            if (advOpt.isPresent()) {
                campaign.setAdvertiser(advOpt.get());
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid Advertiser ID"));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Advertiser is required"));
        }
        
        Campaign saved = campaignRepository.save(campaign);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable Long id, @RequestBody Campaign payload) {
        return campaignRepository.findById(id).map(cam -> {
            cam.setName(payload.getName());
            cam.setStartDate(payload.getStartDate());
            cam.setEndDate(payload.getEndDate());
            cam.setBudget(payload.getBudget());
            cam.setStatus(payload.getStatus());
            cam.setTargetPagesCategories(payload.getTargetPagesCategories());
            if (payload.getAdvertiser() != null && payload.getAdvertiser().getId() != null) {
                advertiserRepository.findById(payload.getAdvertiser().getId()).ifPresent(cam::setAdvertiser);
            }
            Campaign saved = campaignRepository.save(cam);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable Long id) {
        return campaignRepository.findById(id).map(cam -> {
            cam.setStatus("paused"); // Soft deactivation
            campaignRepository.save(cam);
            return ResponseEntity.ok(Map.of("message", "Campaign paused successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // AD SLOTS CRUD
    // ==========================================

    private static final List<Map<String, Object>> DEFAULT_SLOTS = List.of(
        Map.of("name", "Header Ad Slot", "placement", "header", "dimensions", "728x90", "maxConcurrentAds", 1),
        Map.of("name", "Sidebar Ad Slot", "placement", "sidebar", "dimensions", "300x250", "maxConcurrentAds", 2),
        Map.of("name", "In-Article Ad Slot", "placement", "in-article", "dimensions", "600x300", "maxConcurrentAds", 1),
        Map.of("name", "Footer Ad Slot", "placement", "footer", "dimensions", "728x90", "maxConcurrentAds", 1),
        Map.of("name", "Popup Ad Slot", "placement", "popup", "dimensions", "500x500", "maxConcurrentAds", 1)
    );

    @GetMapping("/ad-slots")
    public ResponseEntity<?> getAllAdSlots() {
        List<AdSlot> slots = adSlotRepository.findAll();
        if (slots.isEmpty()) {
            // Seed defaults
            for (Map<String, Object> def : DEFAULT_SLOTS) {
                AdSlot slot = new AdSlot();
                slot.setName((String) def.get("name"));
                slot.setPlacement((String) def.get("placement"));
                slot.setDimensions((String) def.get("dimensions"));
                slot.setMaxConcurrentAds((Integer) def.get("maxConcurrentAds"));
                adSlotRepository.save(slot);
            }
            slots = adSlotRepository.findAll();
        }
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/ad-slots/{id}")
    public ResponseEntity<?> getAdSlotById(@PathVariable Long id) {
        return adSlotRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/ad-slots")
    public ResponseEntity<?> createAdSlot(@RequestBody AdSlot slot) {
        if (adSlotRepository.existsByPlacement(slot.getPlacement())) {
            return ResponseEntity.badRequest().body(Map.of("message", "An ad slot with this placement already exists."));
        }
        AdSlot saved = adSlotRepository.save(slot);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/ad-slots/{id}")
    public ResponseEntity<?> updateAdSlot(@PathVariable Long id, @RequestBody AdSlot payload) {
        return adSlotRepository.findById(id).map(slot -> {
            slot.setName(payload.getName());
            slot.setPlacement(payload.getPlacement());
            slot.setDimensions(payload.getDimensions());
            slot.setMaxConcurrentAds(payload.getMaxConcurrentAds());
            AdSlot saved = adSlotRepository.save(slot);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ad-slots/{id}")
    public ResponseEntity<?> deleteAdSlot(@PathVariable Long id) {
        try {
            adSlotRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Ad Slot deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not delete ad slot. It might be referenced by active ads."));
        }
    }

    // ==========================================
    // ADS CRUD
    // ==========================================

    @GetMapping("/ads")
    public ResponseEntity<?> getAllAds(@RequestParam(value = "type", required = false) String type) {
        if (type != null && !type.isEmpty()) {
            return ResponseEntity.ok(adRepository.findByType(type));
        }
        return ResponseEntity.ok(adRepository.findAll());
    }

    @GetMapping("/ads/{id}")
    public ResponseEntity<?> getAdById(@PathVariable Long id) {
        return adRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/ads")
    public ResponseEntity<?> createAd(@RequestBody Ad ad) {
        if (ad.getCampaign() != null && ad.getCampaign().getId() != null) {
            campaignRepository.findById(ad.getCampaign().getId()).ifPresent(ad::setCampaign);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Campaign is required"));
        }

        if (ad.getAdSlot() != null && ad.getAdSlot().getId() != null) {
            adSlotRepository.findById(ad.getAdSlot().getId()).ifPresent(ad::setAdSlot);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Ad Slot is required"));
        }

        Ad saved = adRepository.save(ad);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/ads/{id}")
    public ResponseEntity<?> updateAd(@PathVariable Long id, @RequestBody Ad payload) {
        return adRepository.findById(id).map(ad -> {
            ad.setType(payload.getType());
            ad.setImageUrl(payload.getImageUrl());
            ad.setHtmlCode(payload.getHtmlCode());
            ad.setClickUrl(payload.getClickUrl());
            ad.setStatus(payload.getStatus());
            ad.setStartDate(payload.getStartDate());
            ad.setEndDate(payload.getEndDate());
            
            // Popup specific
            ad.setDisplayFrequency(payload.getDisplayFrequency());
            ad.setDelaySeconds(payload.getDelaySeconds());
            ad.setCloseButtonRequired(payload.getCloseButtonRequired());

            if (payload.getCampaign() != null && payload.getCampaign().getId() != null) {
                campaignRepository.findById(payload.getCampaign().getId()).ifPresent(ad::setCampaign);
            }
            if (payload.getAdSlot() != null && payload.getAdSlot().getId() != null) {
                adSlotRepository.findById(payload.getAdSlot().getId()).ifPresent(ad::setAdSlot);
            }

            Ad saved = adRepository.save(ad);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ads/{id}")
    public ResponseEntity<?> deleteAd(@PathVariable Long id) {
        try {
            adRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Ad deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not delete ad."));
        }
    }

    // ==========================================
    // AD ANALYTICS
    // ==========================================

    @GetMapping("/ads/analytics")
    public ResponseEntity<?> getAdAnalytics(
            @RequestParam(value = "campaign_id", required = false) Long campaignId,
            @RequestParam(value = "date_range", required = false) String dateRange) {

        // Resolve Date Range
        LocalDateTime start = LocalDateTime.now().minusDays(30).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        if (dateRange != null && !dateRange.isEmpty() && dateRange.contains(",")) {
            String[] parts = dateRange.split(",");
            if (parts.length == 2) {
                try {
                    start = LocalDate.parse(parts[0].trim()).atStartOfDay();
                    end = LocalDate.parse(parts[1].trim()).atTime(23, 59, 59);
                } catch (Exception e) {
                    // Fallback to default
                }
            }
        }

        // Fetch All Ads
        List<Ad> allAds = adRepository.findAll();
        if (campaignId != null) {
            allAds = allAds.stream()
                    .filter(a -> a.getCampaign().getId().equals(campaignId))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> adStats = new ArrayList<>();
        long totalImpressions = 0;
        long totalClicks = 0;

        for (Ad ad : allAds) {
            List<Object[]> rawEvents = adEventRepository.countEventsForAd(ad.getId(), start, end);
            long imps = 0;
            long clicks = 0;
            for (Object[] row : rawEvents) {
                String type = (String) row[0];
                long count = (Long) row[1];
                if ("impression".equalsIgnoreCase(type)) {
                    imps = count;
                } else if ("click".equalsIgnoreCase(type)) {
                    clicks = count;
                }
            }

            double ctr = imps > 0 ? ((double) clicks / imps) * 100.0 : 0.0;
            totalImpressions += imps;
            totalClicks += clicks;

            Map<String, Object> stat = new HashMap<>();
            stat.put("adId", ad.getId());
            stat.put("adType", ad.getType());
            stat.put("campaignName", ad.getCampaign().getName());
            stat.put("advertiserName", ad.getCampaign().getAdvertiser().getCompanyName());
            stat.put("placementName", ad.getAdSlot().getName());
            stat.put("impressions", imps);
            stat.put("clicks", clicks);
            stat.put("ctr", ctr);
            adStats.add(stat);
        }

        // Compute Daily Trend Data
        List<Object[]> trendDataRaw;
        if (campaignId != null) {
            trendDataRaw = adEventRepository.findDailyTrendDataForCampaign(campaignId, start, end);
        } else {
            trendDataRaw = adEventRepository.findDailyTrendData(start, end);
        }

        // Map daily dates to their counts
        Map<String, Map<String, Long>> dailyCounts = new TreeMap<>();
        for (Object[] row : trendDataRaw) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            String type = (String) row[1];
            long count = (Long) row[2];
            String dateStr = sqlDate.toString();

            dailyCounts.putIfAbsent(dateStr, new HashMap<>());
            dailyCounts.get(dateStr).put(type, count);
        }

        // Generate filled trend array for Frontend
        List<Map<String, Object>> dailyTrend = new ArrayList<>();
        LocalDate curr = start.toLocalDate();
        LocalDate last = end.toLocalDate();
        while (!curr.isAfter(last)) {
            String dateStr = curr.toString();
            Map<String, Long> counts = dailyCounts.getOrDefault(dateStr, Collections.emptyMap());
            long imps = counts.getOrDefault("impression", 0L);
            long clicks = counts.getOrDefault("click", 0L);
            double ctr = imps > 0 ? ((double) clicks / imps) * 100.0 : 0.0;

            Map<String, Object> trendPoint = new HashMap<>();
            trendPoint.put("date", dateStr);
            trendPoint.put("impressions", imps);
            trendPoint.put("clicks", clicks);
            trendPoint.put("ctr", ctr);
            dailyTrend.add(trendPoint);

            curr = curr.plusDays(1);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalImpressions", totalImpressions);
        response.put("totalClicks", totalClicks);
        response.put("overallCtr", totalImpressions > 0 ? ((double) totalClicks / totalImpressions) * 100.0 : 0.0);
        response.put("adStats", adStats);
        response.put("trend", dailyTrend);

        return ResponseEntity.ok(response);
    }
}
