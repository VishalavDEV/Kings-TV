package com.kingstv.controllers.admin;

import com.kingstv.models.AggregatedNews;
import com.kingstv.models.RssFeedSource;
import com.kingstv.repository.AggregatedNewsRepository;
import com.kingstv.repository.RssFeedSourceRepository;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;

/**
 * CRUD for admin-managed RSS feed sources.
 *
 * GET    /api/admin/rss-feeds
 * POST   /api/admin/rss-feeds
 * GET    /api/admin/rss-feeds/{id}
 * PUT    /api/admin/rss-feeds/{id}
 * DELETE /api/admin/rss-feeds/{id}
 * POST   /api/admin/rss-feeds/{id}/import-now
 */
@RestController
@RequestMapping("/api/admin/rss-feeds")
public class AdminRssFeedController {

    @Autowired private RssFeedSourceRepository feedRepo;
    @Autowired private AggregatedNewsRepository newsRepo;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<RssFeedSource> result = feedRepo.findAll(
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(Map.of(
            "content", result.getContent(),
            "totalElements", result.getTotalElements(),
            "totalPages", result.getTotalPages()
        ));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RssFeedSource body) {
        if (body.getSourceUrl() == null || body.getSourceUrl().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "sourceUrl is required"));
        }
        if (feedRepo.existsBySourceUrl(body.getSourceUrl())) {
            return ResponseEntity.badRequest().body(Map.of("message", "A feed with this URL already exists"));
        }
        if (body.getSourceName() == null || body.getSourceName().isBlank()) {
            body.setSourceName(body.getSourceUrl());
        }
        if (body.getImportIntervalMinutes() == null || body.getImportIntervalMinutes() <= 0) {
            body.setImportIntervalMinutes(180);
        }
        RssFeedSource saved = feedRepo.save(body);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return feedRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RssFeedSource body) {
        return feedRepo.findById(id).map(existing -> {
            if (body.getSourceName() != null) existing.setSourceName(body.getSourceName());
            if (body.getSourceUrl() != null) existing.setSourceUrl(body.getSourceUrl());
            if (body.getLogoUrl() != null) existing.setLogoUrl(body.getLogoUrl());
            if (body.getCategoryId() != null) existing.setCategoryId(body.getCategoryId());
            if (body.getCategoryName() != null) existing.setCategoryName(body.getCategoryName());
            if (body.getAutoImportEnabled() != null) existing.setAutoImportEnabled(body.getAutoImportEnabled());
            if (body.getImportIntervalMinutes() != null) existing.setImportIntervalMinutes(body.getImportIntervalMinutes());
            if (body.getIsActive() != null) existing.setIsActive(body.getIsActive());
            return ResponseEntity.ok(feedRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!feedRepo.existsById(id)) return ResponseEntity.notFound().build();
        feedRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Feed source deleted"));
    }

    /** Manual import trigger for a specific feed source. */
    @PostMapping("/{id}/import-now")
    public ResponseEntity<?> importNow(@PathVariable Long id) {
        return feedRepo.findById(id).map(source -> {
            int count = 0;
            String errorMsg = null;
            try {
                count = importFeed(source);
                source.setLastImportStatus("OK");
                source.setLastImportError(null);
            } catch (Exception e) {
                errorMsg = e.getMessage();
                source.setLastImportStatus("ERROR");
                source.setLastImportError(e.getMessage());
            }
            source.setLastImportedAt(LocalDateTime.now());
            source.setLastImportCount(count);
            feedRepo.save(source);

            if (errorMsg != null) {
                return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Import failed: " + errorMsg, "imported", count));
            }
            return ResponseEntity.ok(Map.of("message", "Import complete", "imported", count));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── internal import logic ──────────────────────────────────────────────────

    private int importFeed(RssFeedSource source) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(source.getSourceUrl()))
            .GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String xml = response.body()
            .replaceAll("(?i)<!DOCTYPE[^>]*>", "");

        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(
            new java.io.ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8))));

        int count = 0;
        for (SyndEntry entry : feed.getEntries()) {
            String link = entry.getLink();
            if (link == null || link.isBlank()) continue;
            if (newsRepo.existsByExternalLink(link)) continue;

            AggregatedNews item = new AggregatedNews();
            item.setSourceName(source.getSourceName());
            item.setSourceLogo(source.getLogoUrl() != null ? source.getLogoUrl() : "");
            item.setTitle(entry.getTitle() != null ? entry.getTitle().trim() : "Untitled");

            String desc = "";
            if (entry.getDescription() != null) {
                desc = entry.getDescription().getValue();
            } else if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                desc = entry.getContents().get(0).getValue();
            }
            item.setDescription(desc);
            item.setExternalLink(link);
            item.setNoindex(true);

            java.util.Date pubDate = entry.getPublishedDate();
            item.setPublishedTime(pubDate != null
                ? LocalDateTime.ofInstant(pubDate.toInstant(), ZoneId.systemDefault())
                : LocalDateTime.now());

            newsRepo.save(item);
            count++;
        }
        return count;
    }
}
