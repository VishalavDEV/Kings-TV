package com.kingstv.controllers;

import com.kingstv.models.Article;
import com.kingstv.models.Constituency;
import com.kingstv.models.District;
import com.kingstv.models.Permission;
import com.kingstv.models.SystemConfig;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.ConstituencyRepository;
import com.kingstv.repository.DistrictRepository;
import com.kingstv.security.RequiresPermission;
import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class DistrictController {

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ConstituencyRepository constituencyRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SystemConfigService systemConfigService;

    // ─── Public: List all districts ─────────────────────────────────────────────

    @GetMapping("/public/districts")
    public List<District> getDistricts() {
        return districtRepository.findAll();
    }

    @GetMapping("/public/districts/{id}/constituencies")
    public List<Constituency> getConstituencies(@PathVariable Long id) {
        return constituencyRepository.findByDistrictIdOrderByNameEnAsc(id);
    }

    // ─── Public: Nearby News ─────────────────────────────────────────────────────

    /**
     * GET /api/v1/public/news/nearby?lat=&lng=&radiusKm=
     * Returns published articles within radiusKm of the given coordinates.
     * Uses GPS_NEWS_RADIUS_KM system config as default radius.
     */
    @GetMapping("/public/news/nearby")
    public ResponseEntity<?> getNearbyNews(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(required = false) Long districtId,
            @RequestParam(defaultValue = "30") int limit) {

        double effectiveRadius = radiusKm != null ? radiusKm
                : parseDouble(systemConfigService.getConfigValueOrDefault(SystemConfig.GPS_NEWS_RADIUS_KM, "15.0"));

        List<Article> results;

        if (lat != null && lng != null) {
            // Haversine-based: articles whose lat/lng is within radius
            results = articleRepository.findNearbyArticles(lat, lng, effectiveRadius, limit);
        } else if (districtId != null) {
            // District-id fallback
            results = articleRepository.findByDistrictIdAndStatusOrderByPublishedAtDesc(districtId, "published");
            if (results.size() > limit) results = results.subList(0, limit);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Provide lat+lng or districtId"));
        }

        return ResponseEntity.ok(results);
    }

    // ─── Public: Institution News ─────────────────────────────────────────────

    @GetMapping("/public/institution-news")
    public ResponseEntity<?> getPublicInstitutionNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("publishedAt").descending());
        return ResponseEntity.ok(articleRepository.findBySourceAndStatus("institution", "published", pageable));
    }

    // ─── Admin: District CRUD ─────────────────────────────────────────────────

    @GetMapping("/admin/districts")
    @RequiresPermission(Permission.CONFIG_READ)
    public List<District> adminListDistricts() {
        return districtRepository.findAll();
    }

    @PostMapping("/admin/districts")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminCreateDistrict(@RequestBody District district) {
        return ResponseEntity.status(HttpStatus.CREATED).body(districtRepository.save(district));
    }

    @PutMapping("/admin/districts/{id}")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminUpdateDistrict(@PathVariable Long id, @RequestBody District updated) {
        return districtRepository.findById(id)
                .map(d -> {
                    d.setNameEn(updated.getNameEn());
                    d.setNameTa(updated.getNameTa());
                    d.setState(updated.getState());
                    d.setCenterLatitude(updated.getCenterLatitude());
                    d.setCenterLongitude(updated.getCenterLongitude());
                    d.setRadiusKm(updated.getRadiusKm());
                    return ResponseEntity.ok(districtRepository.save(d));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/districts/{id}")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminDeleteDistrict(@PathVariable Long id) {
        return districtRepository.findById(id)
                .map(d -> {
                    districtRepository.delete(d);
                    return ResponseEntity.ok(Map.of("message", "District deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Admin: Constituency CRUD ─────────────────────────────────────────────

    @GetMapping("/admin/districts/{districtId}/constituencies")
    @RequiresPermission(Permission.CONFIG_READ)
    public List<Constituency> adminListConstituencies(@PathVariable Long districtId) {
        return constituencyRepository.findByDistrictIdOrderByNameEnAsc(districtId);
    }

    @PostMapping("/admin/districts/{districtId}/constituencies")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminCreateConstituency(@PathVariable Long districtId, @RequestBody Constituency c) {
        c.setDistrictId(districtId);
        return ResponseEntity.status(HttpStatus.CREATED).body(constituencyRepository.save(c));
    }

    @PutMapping("/admin/constituencies/{id}")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminUpdateConstituency(@PathVariable Long id, @RequestBody Constituency updated) {
        return constituencyRepository.findById(id)
                .map(c -> {
                    c.setNameEn(updated.getNameEn());
                    c.setNameTa(updated.getNameTa());
                    c.setLatitude(updated.getLatitude());
                    c.setLongitude(updated.getLongitude());
                    c.setRadiusKm(updated.getRadiusKm());
                    return ResponseEntity.ok(constituencyRepository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/constituencies/{id}")
    @RequiresPermission(Permission.CONFIG_WRITE)
    public ResponseEntity<?> adminDeleteConstituency(@PathVariable Long id) {
        return constituencyRepository.findById(id)
                .map(c -> {
                    constituencyRepository.delete(c);
                    return ResponseEntity.ok(Map.of("message", "Constituency deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Admin: Institution News Moderation ──────────────────────────────────

    @GetMapping("/admin/institution-news")
    @RequiresPermission(Permission.CONTENT_REVIEW)
    public ResponseEntity<?> adminListInstitutionNews(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("publishedAt").descending());
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(articleRepository.findBySourceAndStatus("institution", status, pageable));
        }
        return ResponseEntity.ok(articleRepository.findBySource("institution", pageable));
    }

    @PutMapping("/admin/institution-news/{id}/approve")
    @RequiresPermission(Permission.CONTENT_REVIEW)
    public ResponseEntity<?> approveInstitutionNews(@PathVariable Long id) {
        return articleRepository.findById(id)
                .filter(a -> "institution".equals(a.getSource()))
                .map(a -> {
                    a.setStatus("published");
                    return ResponseEntity.ok(articleRepository.save(a));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/institution-news/{id}/reject")
    @RequiresPermission(Permission.CONTENT_REVIEW)
    public ResponseEntity<?> rejectInstitutionNews(@PathVariable Long id) {
        return articleRepository.findById(id)
                .filter(a -> "institution".equals(a.getSource()))
                .map(a -> {
                    a.setStatus("rejected");
                    return ResponseEntity.ok(articleRepository.save(a));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 15.0;
        }
    }
}
