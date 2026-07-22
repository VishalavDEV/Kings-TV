package com.kingstv.controllers;

import com.kingstv.models.Ad;
import com.kingstv.models.AdSlot;
import com.kingstv.models.AdEvent;
import com.kingstv.repository.AdRepository;
import com.kingstv.repository.AdSlotRepository;
import com.kingstv.repository.AdEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/ads")
public class PublicAdController {

    @Autowired
    private AdRepository adRepository;

    @Autowired
    private AdSlotRepository adSlotRepository;

    @Autowired
    private AdEventRepository adEventRepository;

    @GetMapping
    public ResponseEntity<?> getActiveAdsForSlot(@RequestParam("slot") String slot) {
        LocalDateTime now = LocalDateTime.now();
        List<Ad> activeAds = adRepository.findActiveAdsForPlacement(slot, now);
        
        // Find configuration for this slot to respect max concurrent ads limit
        Optional<AdSlot> slotOpt = adSlotRepository.findByPlacement(slot);
        int limit = 1;
        if (slotOpt.isPresent()) {
            limit = slotOpt.get().getMaxConcurrentAds() != null ? slotOpt.get().getMaxConcurrentAds() : 1;
        }

        // Shuffle to rotate and apply limit
        Collections.shuffle(activeAds);
        List<Ad> selectedAds = activeAds.stream().limit(limit).collect(Collectors.toList());

        // Log impressions in background/synchronously for selected ads
        for (Ad ad : selectedAds) {
            try {
                ad.setImpressions((ad.getImpressions() != null ? ad.getImpressions() : 0) + 1);
                adRepository.save(ad);
                
                AdEvent event = new AdEvent(ad.getId(), "impression");
                adEventRepository.save(event);
            } catch (Exception e) {
                // Log and ignore to prevent blocking ad delivery
                System.err.println("Failed to log ad impression for ad id " + ad.getId() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok(selectedAds);
    }

    // Support both POST (requested) and GET (useful for fallback links)
    @RequestMapping(value = "/{id}/click", method = {RequestMethod.POST, RequestMethod.GET})
    public void recordClickAndRedirect(@PathVariable("id") Long id, HttpServletResponse response) throws IOException {
        Optional<Ad> opt = adRepository.findById(id);
        String redirectUrl = "/";
        
        if (opt.isPresent()) {
            Ad ad = opt.get();
            try {
                ad.setClicks((ad.getClicks() != null ? ad.getClicks() : 0) + 1);
                adRepository.save(ad);
                
                AdEvent event = new AdEvent(ad.getId(), "click");
                adEventRepository.save(event);
            } catch (Exception e) {
                System.err.println("Failed to log ad click: " + e.getMessage());
            }
            
            if (ad.getClickUrl() != null && !ad.getClickUrl().isEmpty()) {
                redirectUrl = ad.getClickUrl();
            }
        }
        
        response.sendRedirect(redirectUrl);
    }
}
