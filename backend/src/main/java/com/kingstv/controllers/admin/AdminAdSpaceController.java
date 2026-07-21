package com.kingstv.controllers.admin;

import com.kingstv.models.AdSpace;
import com.kingstv.repository.AdSpaceRepository;
import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/ad-spaces")
public class AdminAdSpaceController {

    @Autowired private AdSpaceRepository adSpaceRepository;
    @Autowired private SystemConfigService configService;

    private static final List<Map<String, String>> DEFAULT_PLACEMENTS = List.of(
        Map.of("key", "header", "label", "Header Ad Space (Top Banner)"),
        Map.of("key", "sidebar", "label", "Sidebar Ad Space"),
        Map.of("key", "footer", "label", "Footer Ad Space"),
        Map.of("key", "in_article", "label", "In-Article Ad Space")
    );

    @GetMapping
    public ResponseEntity<?> getAdSpaces() {
        List<AdSpace> spaces = adSpaceRepository.findAll();
        if (spaces.isEmpty()) {
            for (Map<String, String> placement : DEFAULT_PLACEMENTS) {
                AdSpace s = new AdSpace();
                s.setPlacementKey(placement.get("key"));
                s.setPlacementLabel(placement.get("label"));
                s.setIsActive(true);
                adSpaceRepository.save(s);
            }
            spaces = adSpaceRepository.findAll();
        }
        return ResponseEntity.ok(spaces);
    }

    @PutMapping("/{placementKey}")
    public ResponseEntity<?> updateAdSpace(@PathVariable String placementKey, @RequestBody AdSpace payload) {
        Optional<AdSpace> spaceOpt = adSpaceRepository.findByPlacementKey(placementKey);
        AdSpace space = spaceOpt.orElseGet(() -> {
            AdSpace s = new AdSpace();
            s.setPlacementKey(placementKey);
            s.setPlacementLabel(placementKey.toUpperCase() + " Ad Space");
            return s;
        });

        if (payload.getAdCode() != null) space.setAdCode(payload.getAdCode());
        if (payload.getAdImageUrl() != null) space.setAdImageUrl(payload.getAdImageUrl());
        if (payload.getAdUrl() != null) space.setAdUrl(payload.getAdUrl());
        if (payload.getIsActive() != null) space.setIsActive(payload.getIsActive());

        AdSpace saved = adSpaceRepository.save(space);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/adsense-code")
    public ResponseEntity<?> getAdsenseCode() {
        String code = configService.getConfigValueOrDefault("adsense.activation_code", "");
        return ResponseEntity.ok(Map.of("adsenseActivationCode", code));
    }

    @PutMapping("/adsense-code")
    public ResponseEntity<?> saveAdsenseCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("adsenseActivationCode", "");
        configService.setConfigValue("adsense.activation_code", code, "adsense", null, null);
        return ResponseEntity.ok(Map.of("message", "AdSense activation code saved successfully", "adsenseActivationCode", code));
    }
}
