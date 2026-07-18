package com.kingstv.services;

import com.kingstv.models.SystemConfig;
import com.kingstv.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * AI Assistant service for news journalists.
 * Uses Google Gemini API for content generation, translation,
 * summarization, SEO optimization and tag suggestions.
 *
 * Falls back to SystemConfig DB values if env variable is not set.
 */
@Service
public class AiAssistService {

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKeyEnv;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    /**
     * Main entry point: dispatch to the right prompt based on action type.
     */
    public Map<String, Object> assist(String action, String text, String context) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return Map.of("error", true, "result",
                    "AI Assistant is not configured. Please set GEMINI_API_KEY environment variable or configure ai.llm_api_key in System Settings.");
        }

        String prompt = buildPrompt(action, text, context);
        try {
            String result = callGemini(apiKey, prompt);
            return Map.of("error", false, "result", result, "action", action);
        } catch (Exception e) {
            return Map.of("error", true, "result", "AI error: " + e.getMessage());
        }
    }

    /**
     * Check if AI is configured and available.
     */
    public boolean isAvailable() {
        String key = resolveApiKey();
        return key != null && !key.isBlank();
    }

    private String resolveApiKey() {
        // 1. Check env variable first
        if (geminiApiKeyEnv != null && !geminiApiKeyEnv.isBlank()) {
            return geminiApiKeyEnv;
        }
        // 2. Fall back to SystemConfig DB
        return systemConfigRepository.findByConfigKey(SystemConfig.AI_LLM_API_KEY)
                .map(config -> {
                    if (Boolean.TRUE.equals(config.getIsEncrypted())) {
                        return encryptionService.decrypt(config.getConfigValue());
                    }
                    return config.getConfigValue();
                })
                .orElse(null);
    }

    private String buildPrompt(String action, String text, String context) {
        return switch (action != null ? action.toLowerCase() : "") {
            case "headlines" -> """
                    You are a senior news editor for a Tamil-English bilingual news channel called "KINGS 24x7".
                    Generate exactly 5 compelling headline options for the following topic/idea.
                    For each headline, provide both Tamil and English versions.
                    Format each as:
                    1. [Tamil headline] | [English headline]
                    2. [Tamil headline] | [English headline]
                    ... and so on.
                    Make them attention-grabbing, SEO-friendly, and suitable for a major news website.
                    
                    Topic/Idea: """ + text;

            case "expand" -> """
                    You are a professional news journalist. Expand the following text into a detailed,
                    well-structured news paragraph (3-5 sentences). Maintain journalistic tone.
                    Keep the same language as the input (Tamil or English).
                    Do NOT add any prefix or explanation — return only the expanded content.
                    
                    Text to expand: """ + text;

            case "summarize" -> """
                    Summarize the following news content into a concise 2-3 sentence summary.
                    Keep the same language as the input. This will be used as a short description / teaser.
                    Do NOT add any prefix — return only the summary.
                    
                    Content: """ + text;

            case "grammar" -> """
                    You are a professional copy editor. Review the following news text for grammar,
                    spelling, punctuation, and style errors. Return the corrected version only.
                    Keep the same language as the input. Do NOT add explanations.
                    
                    Text: """ + text;

            case "tags" -> """
                    You are an SEO specialist for a news website. Read the following article content
                    and suggest 8-12 relevant news tags/keywords separated by commas.
                    Include a mix of broad and specific tags. Return ONLY the comma-separated tags, nothing else.
                    
                    Article content: """ + text;

            case "seo" -> """
                    You are an SEO specialist for a news website called "KINGS 24x7".
                    Based on the following article content, generate:
                    1. SEO Title (max 60 characters)
                    2. Meta Description (max 155 characters)
                    3. URL Slug (lowercase, hyphens, no special characters)
                    
                    Format your response exactly as:
                    SEO_TITLE: [your title]
                    META_DESC: [your description]
                    SLUG: [your-slug]
                    
                    Article content: """ + text;

            case "translate" -> {
                String direction = context != null && context.equalsIgnoreCase("en2ta") ? "English to Tamil" : "Tamil to English";
                yield """
                        Translate the following text from %s.
                        Return ONLY the translated text, no explanations or prefixes.
                        Maintain the original formatting, paragraphs, and structure.
                        
                        Text: """.formatted(direction) + text;
            }

            case "rewrite" -> {
                String style = context != null ? context : "professional";
                yield """
                        Rewrite the following news text in a %s style.
                        Keep the same language. Return ONLY the rewritten text.
                        
                        Text: """.formatted(style) + text;
            }

            default -> "You are a helpful assistant. " + text;
        };
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String apiKey, String prompt) {
        String url = GEMINI_API_URL + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentsPart = Map.of("parts", List.of(textPart));
        Map<String, Object> body = Map.of("contents", List.of(contentsPart));

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
        return "Unable to generate AI content. Please try again.";
    }
}
