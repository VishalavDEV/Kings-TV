package com.kingstv.controllers.admin;

import com.kingstv.models.MediaAsset;
import com.kingstv.models.Permission;
import com.kingstv.repository.MediaAssetRepository;
import com.kingstv.security.RequiresPermission;
import com.kingstv.services.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {

    @Autowired
    private MediaAssetRepository mediaAssetRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ─── GET /api/admin/media ──────────────────────────────────────────────────
    @GetMapping
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> listMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Clean filters
        String cleanType = (type != null && !type.isBlank()) ? type.toLowerCase() : null;
        String cleanTag = (tag != null && !tag.isBlank()) ? tag : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search : null;

        Page<MediaAsset> result;
        if (cleanType != null) {
            result = mediaAssetRepository.searchAssetsWithMimePrefix(cleanType, cleanTag, cleanSearch, pageable);
        } else {
            result = mediaAssetRepository.searchAssets(null, cleanTag, cleanSearch, pageable);
        }

        return ResponseEntity.ok(result);
    }

    // ─── GET /api/admin/media/{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> getMediaDetail(@PathVariable Long id) {
        return mediaAssetRepository.findById(id)
                .map(asset -> {
                    List<Map<String, Object>> usages = scanMediaUsages(asset.getUrl());
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("asset", asset);
                    response.put("references", usages);
                    response.put("usedInCount", usages.size());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── POST /api/admin/media/upload ──────────────────────────────────────────
    @PostMapping("/upload")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> uploadMedia(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String altText) {

        List<MediaAsset> savedAssets = new ArrayList<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (auth != null && auth.getDetails() instanceof Long) ? (Long) auth.getDetails() : null;

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                // Determine folder type based on mime type
                String folderType = "documents";
                String mimeType = file.getContentType();
                if (mimeType != null) {
                    if (mimeType.startsWith("image/")) folderType = "images";
                    else if (mimeType.startsWith("video/")) folderType = "videos";
                    else if (mimeType.startsWith("audio/")) folderType = "audio";
                }

                // Upload using existing StorageService logic
                String url = storageService.uploadFile(file, folderType);

                // Save MediaAsset entry
                MediaAsset asset = new MediaAsset();
                asset.setFilename(file.getOriginalFilename());
                asset.setUrl(url);
                asset.setMimeType(mimeType != null ? mimeType : "application/octet-stream");
                asset.setSizeBytes(file.getSize());
                asset.setAltText(altText != null ? altText : "");
                asset.setTags(tags != null ? tags : "");
                asset.setUploadedBy(userId);
                asset.setUsedInCount(0);
                asset.setCreatedAt(LocalDateTime.now());

                savedAssets.add(mediaAssetRepository.save(asset));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to upload file " + file.getOriginalFilename() + ": " + e.getMessage()));
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAssets);
    }

    // ─── PUT /api/admin/media/{id} ─────────────────────────────────────────────
    @PutMapping("/{id}")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> updateMetadata(@PathVariable Long id, @RequestBody MediaAsset updated) {
        return mediaAssetRepository.findById(id)
                .map(existing -> {
                    if (updated.getAltText() != null) existing.setAltText(updated.getAltText());
                    if (updated.getTags() != null) existing.setTags(updated.getTags());
                    if (updated.getFilename() != null && !updated.getFilename().isBlank()) {
                        existing.setFilename(updated.getFilename());
                    }
                    return ResponseEntity.ok(mediaAssetRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── POST /api/admin/media/{id}/replace ────────────────────────────────────
    @PostMapping("/{id}/replace")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> replaceFile(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return mediaAssetRepository.findById(id)
                .map(existing -> {
                    if (file.isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Replacement file is empty"));
                    }
                    try {
                        // 1. Physically delete old file (if local)
                        deletePhysicalFile(existing.getUrl());

                        // 2. Upload new file (might generate a new dynamic name/URL or reuse path)
                        String folderType = "documents";
                        String mimeType = file.getContentType();
                        if (mimeType != null) {
                            if (mimeType.startsWith("image/")) folderType = "images";
                            else if (mimeType.startsWith("video/")) folderType = "videos";
                            else if (mimeType.startsWith("audio/")) folderType = "audio";
                        }
                        String newUrl = storageService.uploadFile(file, folderType);

                        // 3. Update database asset details
                        existing.setUrl(newUrl);
                        existing.setFilename(file.getOriginalFilename());
                        existing.setMimeType(mimeType != null ? mimeType : "application/octet-stream");
                        existing.setSizeBytes(file.getSize());
                        existing.setCreatedAt(LocalDateTime.now());

                        return ResponseEntity.ok(mediaAssetRepository.save(existing));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("message", "File replacement failed: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE /api/admin/media/{id} ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> deleteMedia(@PathVariable Long id) {
        return mediaAssetRepository.findById(id)
                .map(asset -> {
                    // Check if used in posts/pages
                    List<Map<String, Object>> usages = scanMediaUsages(asset.getUrl());
                    if (!usages.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                            "referenced", true,
                            "message", "Cannot delete asset. It is currently referenced in system components.",
                            "references", usages
                        ));
                    }

                    // Physically delete file
                    deletePhysicalFile(asset.getUrl());

                    // Delete DB asset entry
                    mediaAssetRepository.delete(asset);
                    return ResponseEntity.ok(Map.of("message", "Media asset deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Bulk Actions ──────────────────────────────────────────────────────────
    @PostMapping("/bulk-delete")
    @RequiresPermission(Permission.MODULE_MEDIA_LIBRARY)
    public ResponseEntity<?> bulkDeleteMedia(@RequestBody List<Long> ids) {
        List<Map<String, Object>> failed = new ArrayList<>();
        int deletedCount = 0;

        for (Long id : ids) {
            Optional<MediaAsset> opt = mediaAssetRepository.findById(id);
            if (opt.isPresent()) {
                MediaAsset asset = opt.get();
                List<Map<String, Object>> usages = scanMediaUsages(asset.getUrl());
                if (!usages.isEmpty()) {
                    failed.add(Map.of(
                        "id", id,
                        "filename", asset.getFilename(),
                        "references", usages
                    ));
                } else {
                    deletePhysicalFile(asset.getUrl());
                    mediaAssetRepository.delete(asset);
                    deletedCount++;
                }
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("deletedCount", deletedCount);
        response.put("failedCount", failed.size());
        response.put("failures", failed);
        return ResponseEntity.ok(response);
    }

    // ─── Helper Methods ────────────────────────────────────────────────────────

    private void deletePhysicalFile(String url) {
        if (url != null && url.startsWith("/uploads/")) {
            try {
                String relPath = url.substring(1); // strip leading slash
                Path physicalPath = Paths.get(relPath).toAbsolutePath();
                Files.deleteIfExists(physicalPath);
            } catch (IOException e) {
                System.err.println("Could not delete physical file: " + e.getMessage());
            }
        }
    }

    private List<Map<String, Object>> scanMediaUsages(String url) {
        List<Map<String, Object>> usages = new ArrayList<>();
        if (url == null || url.isBlank()) return usages;

        // 1. Articles image or content
        try {
            String q = "SELECT article_id, title_en, 'Article' AS type FROM articles " +
                       "WHERE image_url = ? OR thumbnail_url = ? OR content LIKE ?";
            List<Map<String, Object>> list = jdbcTemplate.queryForList(q, url, url, "%" + url + "%");
            for (Map<String, Object> m : list) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", m.get("article_id"));
                u.put("title", m.get("title_en") != null ? m.get("title_en") : "Untitled Article");
                u.put("type", m.get("type"));
                usages.add(u);
            }
        } catch (Exception e) { /* ignore */ }

        // 2. Advertisements
        try {
            String q = "SELECT ad_id, title, 'Advertisement' AS type FROM advertisements WHERE image_url = ?";
            List<Map<String, Object>> list = jdbcTemplate.queryForList(q, url);
            for (Map<String, Object> m : list) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", m.get("ad_id"));
                u.put("title", m.get("title") != null ? m.get("title") : "Untitled Advertisement");
                u.put("type", m.get("type"));
                usages.add(u);
            }
        } catch (Exception e) { /* ignore */ }

        // 3. Obituaries
        try {
            String q = "SELECT obit_id, deceased_name, 'Obituary' AS type FROM local_obituaries WHERE photo = ?";
            List<Map<String, Object>> list = jdbcTemplate.queryForList(q, url);
            for (Map<String, Object> m : list) {
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id", m.get("obit_id"));
                u.put("title", m.get("deceased_name") != null ? m.get("deceased_name") : "Deceased Person");
                u.put("type", m.get("type"));
                usages.add(u);
            }
        } catch (Exception e) { /* ignore */ }

        return usages;
    }
}
