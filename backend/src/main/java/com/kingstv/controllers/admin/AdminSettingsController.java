package com.kingstv.controllers.admin;

import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Admin settings controller — visual & general settings.
 *
 * GET/PUT /api/admin/settings/visual   — site colours, post list style, logo URLs
 * GET/PUT /api/admin/settings/general  — 7-tab general settings
 */
@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    @Autowired
    private SystemConfigService configService;

    // ─── Visual Settings ───────────────────────────────────────────────────────

    @GetMapping("/visual")
    public ResponseEntity<?> getVisualSettings() {
        Map<String, String> result = new LinkedHashMap<>();
        for (String key : VISUAL_KEYS) {
            String shortKey = key.substring(key.lastIndexOf('.') + 1);
            result.put(shortKey, configService.getConfigValueOrDefault(key, ""));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/visual")
    public ResponseEntity<?> saveVisualSettings(@RequestBody Map<String, String> body) {
        Long userId = getCallerId();
        body.forEach((k, v) -> configService.setConfigValue("visual." + k, v, "visual", null, userId));
        return ResponseEntity.ok(Map.of("message", "Visual settings saved"));
    }

    // ─── General Settings ─────────────────────────────────────────────────────

    @GetMapping("/general")
    public ResponseEntity<?> getGeneralSettings() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("general",      readSection(GENERAL_INFO_KEYS));
        result.put("contact",      readSection(CONTACT_KEYS));
        result.put("social",       readSection(SOCIAL_KEYS));
        result.put("fbComments",   readSection(FB_COMMENTS_KEYS));
        result.put("cookies",      readSection(COOKIES_KEYS));
        result.put("customCss",    configService.getConfigValueOrDefault("general.custom_css", ""));
        result.put("customJs",     configService.getConfigValueOrDefault("general.custom_js", ""));
        result.put("recaptcha",    readSection(RECAPTCHA_KEYS));
        result.put("maintenance",  readSection(MAINTENANCE_KEYS));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/general")
    public ResponseEntity<?> saveGeneralSettings(@RequestBody Map<String, Object> body) {
        Long userId = getCallerId();

        saveSection(body, "general",    "general",    userId);
        saveSection(body, "contact",    "general",    userId);
        saveSection(body, "social",     "general",    userId);
        saveSection(body, "fbComments", "general",    userId);
        saveSection(body, "cookies",    "general",    userId);
        saveSection(body, "recaptcha",  "general",    userId);
        saveSection(body, "maintenance","general",    userId);

        if (body.containsKey("customCss")) {
            configService.setConfigValue("general.custom_css", String.valueOf(body.get("customCss")), "general", null, userId);
        }
        if (body.containsKey("customJs")) {
            configService.setConfigValue("general.custom_js", String.valueOf(body.get("customJs")), "general", null, userId);
        }
        return ResponseEntity.ok(Map.of("message", "General settings saved"));
    }

    // ─── Key constants ────────────────────────────────────────────────────────

    private static final List<String> VISUAL_KEYS = List.of(
        "visual.site_color",
        "visual.header_color",
        "visual.post_list_style",
        "visual.logo_url",
        "visual.logo_footer_url",
        "visual.logo_email_url"
    );

    private static final List<String> GENERAL_INFO_KEYS = List.of(
        "general.site_title",
        "general.site_tagline",
        "general.admin_email",
        "general.site_language",
        "general.timezone",
        "general.date_format",
        "general.time_format"
    );

    private static final List<String> CONTACT_KEYS = List.of(
        "general.contact.address",
        "general.contact.phone",
        "general.contact.email",
        "general.contact.map_embed_url"
    );

    private static final List<String> SOCIAL_KEYS = List.of(
        "general.social.facebook",
        "general.social.twitter",
        "general.social.instagram",
        "general.social.pinterest",
        "general.social.linkedin",
        "general.social.vk",
        "general.social.telegram",
        "general.social.youtube"
    );

    private static final List<String> FB_COMMENTS_KEYS = List.of(
        "general.fb_comments.enabled",
        "general.fb_comments.app_id",
        "general.fb_comments.num_posts",
        "general.fb_comments.order_by"
    );

    private static final List<String> COOKIES_KEYS = List.of(
        "general.cookies.enabled",
        "general.cookies.message",
        "general.cookies.button_text",
        "general.cookies.policy_url"
    );

    private static final List<String> RECAPTCHA_KEYS = List.of(
        "general.recaptcha.enabled",
        "general.recaptcha.site_key",
        "general.recaptcha.secret_key"
    );

    private static final List<String> MAINTENANCE_KEYS = List.of(
        "general.maintenance.enabled",
        "general.maintenance.title",
        "general.maintenance.message"
    );

    // ─── helpers ─────────────────────────────────────────────────────────────

    private Map<String, String> readSection(List<String> keys) {
        Map<String, String> map = new LinkedHashMap<>();
        for (String fullKey : keys) {
            // short key: last segment after '.'
            String shortKey = fullKey.substring(fullKey.lastIndexOf('.') + 1);
            map.put(shortKey, configService.getConfigValueOrDefault(fullKey, ""));
        }
        return map;
    }

    @SuppressWarnings("unchecked")
    private void saveSection(Map<String, Object> body, String sectionKey, String group, Long userId) {
        Object section = body.get(sectionKey);
        if (section instanceof Map) {
            ((Map<String, String>) section).forEach((k, v) -> {
                String configKey = deriveKey(sectionKey, k);
                configService.setConfigValue(configKey, v, group, null, userId);
            });
        }
    }

    /** Map from section + shortKey back to the full SystemConfig key. */
    private String deriveKey(String section, String shortKey) {
        return switch (section) {
            case "general"    -> "general." + shortKey;
            case "contact"    -> "general.contact." + shortKey;
            case "social"     -> "general.social." + shortKey;
            case "fbComments" -> "general.fb_comments." + shortKey;
            case "cookies"    -> "general.cookies." + shortKey;
            case "recaptcha"  -> "general.recaptcha." + shortKey;
            case "maintenance"-> "general.maintenance." + shortKey;
            default           -> "general." + shortKey;
        };
    }

    private Long getCallerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Long) return (Long) auth.getDetails();
        return null;
    }
}
