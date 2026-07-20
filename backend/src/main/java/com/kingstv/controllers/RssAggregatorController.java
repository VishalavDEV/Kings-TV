package com.kingstv.controllers;

import com.kingstv.models.AggregatedNews;
import com.kingstv.repository.AggregatedNewsRepository;
import com.kingstv.services.RssAggregatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rss-aggregator")
public class RssAggregatorController {

    @Autowired
    private RssAggregatorService rssAggregatorService;

    @Autowired
    private AggregatedNewsRepository aggregatedNewsRepository;

    @GetMapping("/latest")
    public Page<AggregatedNews> getLatestAggregated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return aggregatedNewsRepository.findAllByOrderByPublishedTimeDesc(pageable);
    }

    @PostMapping("/fetch")
    public ResponseEntity<?> forceFetch() {
        try {
            rssAggregatorService.fetchAggregatedFeeds();
            return ResponseEntity.ok(Map.of("message", "RSS feeds fetch triggered and completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error triggering RSS feeds fetch", "error", e.getMessage()));
        }
    }
}
