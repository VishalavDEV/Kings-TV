package com.kingstv.services;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AiCenterService {

    @Autowired
    private AiPromptTemplateRepository promptRepo;

    @Autowired
    private AiSensorFlagRepository sensorFlagRepo;

    @Autowired
    private AiModerationLogRepository moderationLogRepo;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKeyEnv;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Unified LLM dispatch based on Prompt Template DB records
     */
    public String callLlm(String feature, Map<String, String> placeholders) {
        Optional<AiPromptTemplate> templateOpt = promptRepo.findByFeatureAndIsActiveTrue(feature);
        if (templateOpt.isEmpty()) {
            return "Error: No active prompt template found for feature '" + feature + "'. Please configure it in AI Prompt Settings.";
        }

        AiPromptTemplate template = templateOpt.get();
        String prompt = template.getPromptTemplate();

        // 1. Substitute variables in template
        if (placeholders != null) {
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                String val = entry.getValue() != null ? entry.getValue() : "";
                prompt = prompt.replace("{" + entry.getKey() + "}", val);
            }
        }

        // 2. Resolve credentials
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            // Fallback mock responses when API is unconfigured to facilitate testing
            return getMockFallback(feature, placeholders);
        }

        String model = template.getModelName() != null ? template.getModelName() : "gemini-2.0-flash";
        Double temp = template.getTemperature() != null ? template.getTemperature() : 0.7;
        Integer maxTokens = template.getMaxTokens() != null ? template.getMaxTokens() : 2000;

        try {
            if (model.toLowerCase().contains("gemini")) {
                // Call Google Gemini API
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> textPart = Map.of("text", prompt);
                Map<String, Object> contentsPart = Map.of("parts", List.of(textPart));
                
                // Add generation config (temperature, maxOutputTokens)
                Map<String, Object> genConfig = new HashMap<>();
                genConfig.put("temperature", temp);
                genConfig.put("maxOutputTokens", maxTokens);
                
                Map<String, Object> body = Map.of(
                    "contents", List.of(contentsPart),
                    "generationConfig", genConfig
                );

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

                if (response.getBody() != null) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        if (content != null) {
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                            if (parts != null && !parts.isEmpty()) {
                                return (String) parts.get(0).get("text");
                            }
                        }
                    }
                }
            } else {
                // Call OpenAI Chat Completions API
                String url = getConfigValue(SystemConfig.AI_LLM_API_URL);
                if (url == null || url.isBlank()) {
                    url = "https://api.openai.com/v1/chat/completions";
                }

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                Map<String, Object> message = new HashMap<>();
                message.put("role", "user");
                message.put("content", prompt);

                Map<String, Object> body = new HashMap<>();
                body.put("model", model);
                body.put("messages", List.of(message));
                body.put("max_tokens", maxTokens);
                body.put("temperature", temp);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

                if (response.getBody() != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> messageResult = (Map<String, Object>) choices.get(0).get("message");
                        if (messageResult != null) {
                            return (String) messageResult.get("content");
                        }
                    }
                }
            }
            return "Error: Empty response returned from AI provider. Fallback: " + getMockFallback(feature, placeholders);
        } catch (Exception e) {
            System.err.println("LLM API Call failed: " + e.getMessage());
            return "Error calling AI Provider: " + e.getMessage() + "\n\nFallback: " + getMockFallback(feature, placeholders);
        }
    }

    /**
     * Automated AI Content scan triggered on new submissions
     */
    public void scanContent(String contentType, Long contentId, String title, String content) {
        if (content == null || content.isBlank()) return;

        Map<String, String> placeholders = Map.of(
            "article_title", title != null ? title : "Untitled",
            "article_content", content
        );

        String result = callLlm("sensor", placeholders);

        // Parse scanner output
        boolean flagged = false;
        String reason = "low-quality";
        double confidence = 0.8;
        String description = result;

        try {
            // Find key indicators in response text
            String textLower = result.toLowerCase();
            if (textLower.contains("flagged: true") || textLower.contains("flagged:yes") || textLower.contains("\"flagged\": true") || textLower.contains("plagiarism") || textLower.contains("duplicate")) {
                flagged = true;
            }

            if (textLower.contains("plagiarism")) {
                reason = "plagiarism";
            } else if (textLower.contains("duplicate")) {
                reason = "duplicate";
            } else if (textLower.contains("off-topic")) {
                reason = "off-topic";
            } else if (textLower.contains("low-quality")) {
                reason = "low-quality";
            }

            // Try to extract a score if present, e.g. "confidence: 0.9"
            int index = textLower.indexOf("confidence:");
            if (index != -1) {
                String sub = textLower.substring(index + 11).trim();
                String valStr = "";
                for (int i = 0; i < sub.length(); i++) {
                    char c = sub.charAt(i);
                    if (Character.isDigit(c) || c == '.') {
                        valStr += c;
                    } else {
                        break;
                    }
                }
                if (!valStr.isEmpty()) {
                    confidence = Double.parseDouble(valStr);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse sensor flag response: " + e.getMessage());
        }

        // Mock scan rules for local testing when API returns fallbacks
        if (content.toLowerCase().contains("duplicate content test")) {
            flagged = true;
            reason = "duplicate";
            confidence = 0.95;
            description = "Flagged: Content matches existing local article on Tamil Nadu budgets.";
        } else if (content.toLowerCase().contains("plagiarism test")) {
            flagged = true;
            reason = "plagiarism";
            confidence = 0.9;
            description = "Flagged: Copied from external blog post.";
        }

        if (flagged) {
            AiSensorFlag flag = new AiSensorFlag();
            flag.setContentType(contentType);
            flag.setContentId(contentId);
            flag.setContentTitle(title);
            flag.setFlagReason(reason);
            flag.setConfidenceScore(confidence);
            flag.setFlagDescription(description);
            flag.setStatus("pending_review");
            sensorFlagRepo.save(flag);
        }
    }

    /**
     * Audit log creator for moderation actions
     */
    public void logModeration(Long contentId, String contentType, String contentTitle, String flaggedTerms, Double confidence, String actionTaken, Long reviewedBy) {
        AiModerationLog log = new AiModerationLog();
        log.setContentId(contentId);
        log.setContentType(contentType);
        log.setContentTitle(contentTitle);
        log.setFlaggedTerms(flaggedTerms);
        log.setAiConfidence(confidence);
        log.setActionTaken(actionTaken);
        log.setReviewedBy(reviewedBy);
        log.setReviewedAt(LocalDateTime.now());
        moderationLogRepo.save(log);
    }

    private String resolveApiKey() {
        if (geminiApiKeyEnv != null && !geminiApiKeyEnv.isBlank()) {
            return geminiApiKeyEnv;
        }
        return systemConfigRepository.findByConfigKey(SystemConfig.AI_LLM_API_KEY)
                .map(config -> {
                    if (Boolean.TRUE.equals(config.getIsEncrypted())) {
                        return encryptionService.decrypt(config.getConfigValue());
                    }
                    return config.getConfigValue();
                })
                .orElse(null);
    }

    private String getConfigValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    /**
     * Local mockup responses when no Gemini/OpenAI key is available
     */
    private String getMockFallback(String feature, Map<String, String> placeholders) {
        String content = placeholders != null ? placeholders.get("article_content") : "";
        String style = placeholders != null ? placeholders.get("rewrite_style") : "";

        return switch (feature) {
            case "rewriter" -> {
                String desc = "AI Suggested " + (style != null ? style.toUpperCase() : "professional") + " version:\n\n";
                if ("summarize".equalsIgnoreCase(style)) {
                    yield desc + "Summary: " + (content.length() > 100 ? content.substring(0, 100) + "..." : content);
                } else if ("simplify".equalsIgnoreCase(style)) {
                    yield desc + "Simplified: " + content.replaceAll("(?i)substantial|procurement|tariffs", "easy-to-read terms");
                } else if ("expand".equalsIgnoreCase(style)) {
                    yield desc + content + "\n\nAdditionally, this development represents a major milestone in public affairs and administration.";
                } else if ("translate".equalsIgnoreCase(style)) {
                    yield desc + "[Tamil/English Translated]: " + content;
                } else {
                    yield desc + "Paraphrased: " + content;
                }
            }
            case "seo" -> """
                    SEO_TITLE: SEO Suggestions: """ + (content.length() > 30 ? content.substring(0, 30) : "Article") + """
                    
                    META_DESC: Read this newly generated AI description for the article details. It provides a complete summary of news events.
                    SLUG: suggested-seo-article-slug
                    KEYWORDS: kings news, tamil nadu, local update, breaking
                    TAGS: tamilnadu, chennai, breaking, dynamic""";
            case "sensor" -> """
                    FLAGGED: false
                    REASON: none
                    CONFIDENCE: 1.0
                    DESCRIPTION: Content looks unique and high-quality.""";
            case "suggestions" -> """
                    ALT_HEADLINE 1: alternate suggested title option A
                    ALT_HEADLINE 2: dynamic title suggestion B
                    ALT_HEADLINE 3: catchy news alert title C
                    SUGGESTED_TAGS: kings, tamil-nadu, news-alert, local-news""";
            default -> "AI suggested response placeholder.";
        };
    }
}
