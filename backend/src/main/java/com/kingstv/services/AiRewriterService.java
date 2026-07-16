package com.kingstv.services;

import com.kingstv.models.SystemConfig;
import com.kingstv.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * AI Content Rewriter service.
 * Integrates with a configurable LLM API (e.g., OpenAI, Gemini) for
 * rewrite/paraphrase suggestions. Available to MJ and Institution Login roles.
 */
@Service
public class AiRewriterService {

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private EncryptionService encryptionService;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Rewrites/paraphrases the given text using the configured LLM API.
     */
    public String rewriteContent(String text, String style) {
        String apiUrl = getConfigValue(SystemConfig.AI_LLM_API_URL);
        String apiKey = getEncryptedConfigValue(SystemConfig.AI_LLM_API_KEY);
        String model = getConfigValue(SystemConfig.AI_LLM_MODEL);

        if (apiUrl == null || apiKey == null) {
            return "AI Rewriter is not configured. Please ask your Super Admin to set up the LLM API credentials.";
        }

        if (model == null) model = "gpt-3.5-turbo";

        String prompt = buildPrompt(text, style);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(message));
            body.put("max_tokens", 2000);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, Map.class);

            if (response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> messageResult = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageResult.get("content");
                }
            }
            return "Unable to generate rewrite. Please try again.";
        } catch (Exception e) {
            return "AI Rewriter error: " + e.getMessage();
        }
    }

    private String buildPrompt(String text, String style) {
        String styleInstruction = switch (style != null ? style.toLowerCase() : "professional") {
            case "formal" -> "Rewrite in a formal, professional tone suitable for news publishing.";
            case "casual" -> "Rewrite in a conversational, easy-to-read tone.";
            case "concise" -> "Rewrite to be more concise while keeping all key information.";
            case "detailed" -> "Expand and elaborate on the content, adding more context.";
            default -> "Rewrite professionally for a news publication.";
        };

        return styleInstruction + "\n\nOriginal text:\n" + text;
    }

    private String getConfigValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    private String getEncryptedConfigValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(config -> {
                    if (Boolean.TRUE.equals(config.getIsEncrypted())) {
                        return encryptionService.decrypt(config.getConfigValue());
                    }
                    return config.getConfigValue();
                })
                .orElse(null);
    }
}
