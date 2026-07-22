package com.kingstv.controllers.admin;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import com.kingstv.services.AiCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/admin/ai", "/api/v1/admin/ai"})
@CrossOrigin(origins = "*")
public class AdminAiController {

    @Autowired
    private AiCenterService aiCenterService;

    @Autowired
    private AiPromptTemplateRepository promptRepo;

    @Autowired
    private AiSensorFlagRepository sensorFlagRepo;

    @Autowired
    private AiModerationLogRepository moderationLogRepo;

    @Autowired
    private ArticleRepository articleRepository;

    // ── 1. PROMPTS CRUD ───────────────────────────────────────────────

    @GetMapping("/prompts")
    public ResponseEntity<List<AiPromptTemplate>> getAllPrompts() {
        return ResponseEntity.ok(promptRepo.findAll());
    }

    @GetMapping("/prompts/{id}")
    public ResponseEntity<?> getPromptById(@PathVariable Long id) {
        return promptRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/prompts")
    public ResponseEntity<?> createPrompt(@RequestBody AiPromptTemplate prompt) {
        if (promptRepo.findByFeature(prompt.getFeature()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt template for feature '" + prompt.getFeature() + "' already exists."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(promptRepo.save(prompt));
    }

    @PutMapping("/prompts/{id}")
    public ResponseEntity<?> updatePrompt(@PathVariable Long id, @RequestBody AiPromptTemplate promptDetails) {
        return promptRepo.findById(id).map(prompt -> {
            prompt.setPromptTemplate(promptDetails.getPromptTemplate());
            prompt.setModelName(promptDetails.getModelName());
            prompt.setTemperature(promptDetails.getTemperature());
            prompt.setMaxTokens(promptDetails.getMaxTokens());
            prompt.setIsActive(promptDetails.getIsActive());
            return ResponseEntity.ok(promptRepo.save(prompt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/prompts/{id}")
    public ResponseEntity<?> deletePrompt(@PathVariable Long id) {
        return promptRepo.findById(id).map(prompt -> {
            promptRepo.delete(prompt);
            return ResponseEntity.ok(Map.of("message", "Prompt template deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── 2. AI GENERATION ENDPOINTS ──────────────────────────────────────

    @PostMapping("/rewrite")
    public ResponseEntity<?> rewriteContent(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String style = body.get("style"); // summarize, simplify, expand, translate, change-tone
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
        }

        Map<String, String> placeholders = Map.of(
            "article_content", content,
            "rewrite_style", style != null ? style : "professional"
        );

        String suggestion = aiCenterService.callLlm("rewriter", placeholders);
        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @PostMapping("/seo-generate")
    public ResponseEntity<?> seoGenerate(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
        }

        Map<String, String> placeholders = Map.of("article_content", content);
        String rawSeo = aiCenterService.callLlm("seo", placeholders);

        // Parse structured output
        Map<String, String> seoMap = new HashMap<>();
        seoMap.put("title", "");
        seoMap.put("description", "");
        seoMap.put("slug", "");
        seoMap.put("keywords", "");
        seoMap.put("tags", "");

        try {
            String[] lines = rawSeo.split("\n");
            for (String line : lines) {
                if (line.startsWith("SEO_TITLE:")) {
                    seoMap.put("title", line.substring(10).trim());
                } else if (line.startsWith("META_DESC:")) {
                    seoMap.put("description", line.substring(10).trim());
                } else if (line.startsWith("SLUG:")) {
                    seoMap.put("slug", line.substring(5).trim());
                } else if (line.startsWith("KEYWORDS:")) {
                    seoMap.put("keywords", line.substring(9).trim());
                } else if (line.startsWith("TAGS:")) {
                    seoMap.put("tags", line.substring(5).trim());
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing SEO response: " + e.getMessage());
        }

        // Fallbacks if parse missed fields
        if (seoMap.get("title").isEmpty()) {
            seoMap.put("title", "SEO Title suggestion based on content");
        }
        if (seoMap.get("description").isEmpty()) {
            seoMap.put("description", "Meta description suggestions based on content.");
        }

        return ResponseEntity.ok(seoMap);
    }

    @PostMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
        }

        Map<String, String> placeholders = Map.of("article_content", content);
        String suggestions = aiCenterService.callLlm("suggestions", placeholders);

        // Parse suggested headlines and tags
        List<String> headlines = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        try {
            String[] lines = suggestions.split("\n");
            for (String line : lines) {
                if (line.toLowerCase().startsWith("alt_headline") || line.matches("^\\d+\\..*")) {
                    String clean = line.replaceFirst("(?i)alt_headline\\s*\\d*:\\s*", "").replaceFirst("^\\d+\\.\\s*", "").trim();
                    headlines.add(clean);
                } else if (line.toLowerCase().startsWith("suggested_tags:")) {
                    String rawTags = line.substring(15).trim();
                    tags = Arrays.asList(rawTags.split("\\s*,\\s*"));
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing suggestions response: " + e.getMessage());
        }

        // Fallbacks
        if (headlines.isEmpty()) {
            headlines = Arrays.asList("Alternate Title suggestion 1", "Alternate Title suggestion 2", "Alternate Title suggestion 3");
        }
        if (tags.isEmpty()) {
            tags = Arrays.asList("kings", "news-alerts", "breaking");
        }

        return ResponseEntity.ok(Map.of(
            "headlines", headlines,
            "tags", tags
        ));
    }

    // ── 3. AI SENSOR REVIEW QUEUE ────────────────────────────────────────

    @GetMapping("/sensor/flags")
    public ResponseEntity<?> getSensorFlags(
            @RequestParam(defaultValue = "pending_review") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AiSensorFlag> list = sensorFlagRepo.findByStatusOrderByCreatedAtDesc(status, pageable);
        return ResponseEntity.ok(Map.of(
            "flags", list.getContent(),
            "totalPages", list.getTotalPages(),
            "totalElements", list.getTotalElements(),
            "currentPage", list.getNumber()
        ));
    }

    @PostMapping("/sensor/flags/{id}/action")
    public ResponseEntity<?> actionSensorFlag(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return sensorFlagRepo.findById(id).map(flag -> {
            String action = (String) body.get("action"); // dismiss, take_action (e.g., delete_content/suspend_user)
            Long reviewerId = body.get("reviewedBy") != null ? Long.parseLong(body.get("reviewedBy").toString()) : null;
            String notes = (String) body.get("notes");

            if ("dismiss".equalsIgnoreCase(action)) {
                flag.setStatus("dismissed");
                sensorFlagRepo.save(flag);
                aiCenterService.logModeration(flag.getContentId(), flag.getContentType(), flag.getContentTitle(), "Sensor Scan: " + flag.getFlagReason(), flag.getConfidenceScore(), "DISMISSED", reviewerId);
            } else if ("take_action".equalsIgnoreCase(action)) {
                flag.setStatus("actioned");
                sensorFlagRepo.save(flag);

                // Simulate taking action (e.g., changing article status to BLOCKED or draft)
                if ("ARTICLE".equalsIgnoreCase(flag.getContentType())) {
                    articleRepository.findById(flag.getContentId()).ifPresent(art -> {
                        art.setStatus("BLOCKED");
                        articleRepository.save(art);
                    });
                }
                aiCenterService.logModeration(flag.getContentId(), flag.getContentType(), flag.getContentTitle(), "Sensor Scan: " + flag.getFlagReason(), flag.getConfidenceScore(), "CONTENT_BLOCKED: " + notes, reviewerId);
            }

            return ResponseEntity.ok(Map.of("message", "Flag review completed successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Manual scan endpoint
    @PostMapping("/sensor/scan")
    public ResponseEntity<?> triggerManualScan(@RequestBody Map<String, String> body) {
        String contentType = body.get("contentType");
        String contentIdStr = body.get("contentId");
        String title = body.get("title");
        String content = body.get("content");

        if (content == null || content.isBlank() || contentType == null || contentIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters (content, contentType, contentId)."));
        }

        Long contentId = Long.parseLong(contentIdStr);
        aiCenterService.scanContent(contentType, contentId, title, content);
        return ResponseEntity.ok(Map.of("message", "AI Sensor scan completed."));
    }

    // ── 4. AI MODERATION AUDIT LOGS ──────────────────────────────────────

    @GetMapping("/moderation/logs")
    public ResponseEntity<?> getModerationLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AiModerationLog> list = moderationLogRepo.findByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(Map.of(
            "logs", list.getContent(),
            "totalPages", list.getTotalPages(),
            "totalElements", list.getTotalElements(),
            "currentPage", list.getNumber()
        ));
    }
}
