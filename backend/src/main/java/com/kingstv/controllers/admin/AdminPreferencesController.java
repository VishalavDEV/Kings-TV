package com.kingstv.controllers.admin;

import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Admin preferences controller.
 * Stores all preferences as key-value pairs in system_config under group "preferences".
 *
 * GET  /api/admin/preferences          — returns structured preference object
 * PUT  /api/admin/preferences          — saves all preference fields
 */
@RestController
@RequestMapping("/api/admin/preferences")
public class AdminPreferencesController {

    @Autowired
    private SystemConfigService configService;

    private static final String GROUP = "preferences";

    // All preference keys
    private static final List<String> GENERAL_KEYS = List.of(
        "pref.general.site_name",
        "pref.general.admin_email",
        "pref.general.posts_per_page",
        "pref.general.enable_comments",
        "pref.general.enable_registration",
        "pref.general.enable_author_bio"
    );

    private static final List<String> HOMEPAGE_KEYS = List.of(
        "pref.homepage.show_featured_section",
        "pref.homepage.show_latest_on_homepage",
        "pref.homepage.show_news_ticker",
        "pref.homepage.show_latest_on_slider",
        "pref.homepage.show_latest_on_featured",
        "pref.homepage.sort_slider_by",
        "pref.homepage.sort_featured_by"
    );

    private static final List<String> POSTS_KEYS = List.of(
        "pref.posts.show_author",
        "pref.posts.show_date",
        "pref.posts.show_reading_time",
        "pref.posts.show_share_buttons",
        "pref.posts.show_related_posts",
        "pref.posts.show_view_count",
        "pref.posts.enable_print_button",
        "pref.posts.show_tags"
    );

    private static final List<String> POST_FORMATS_KEYS = List.of(
        "pref.formats.enable_video_post",
        "pref.formats.enable_gallery_post",
        "pref.formats.enable_audio_post",
        "pref.formats.enable_quote_post",
        "pref.formats.enable_link_post",
        "pref.formats.enable_review_post"
    );

    @GetMapping
    public ResponseEntity<?> getPreferences() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("general", readGroup(GENERAL_KEYS));
        result.put("homepage", readGroup(HOMEPAGE_KEYS));
        result.put("posts", readGroup(POSTS_KEYS));
        result.put("postFormats", readGroup(POST_FORMATS_KEYS));
        return ResponseEntity.ok(result);
    }

    @PutMapping
    public ResponseEntity<?> savePreferences(@RequestBody Map<String, Map<String, String>> body) {
        Long userId = getCallerId();
        if (body.containsKey("general")) {
            body.get("general").forEach((k, v) -> configService.setConfigValue("pref.general." + k, v, GROUP, null, userId));
        }
        if (body.containsKey("homepage")) {
            body.get("homepage").forEach((k, v) -> configService.setConfigValue("pref.homepage." + k, v, GROUP, null, userId));
        }
        if (body.containsKey("posts")) {
            body.get("posts").forEach((k, v) -> configService.setConfigValue("pref.posts." + k, v, GROUP, null, userId));
        }
        if (body.containsKey("postFormats")) {
            body.get("postFormats").forEach((k, v) -> configService.setConfigValue("pref.formats." + k, v, GROUP, null, userId));
        }
        return ResponseEntity.ok(Map.of("message", "Preferences saved successfully"));
    }

    // ── helpers ──

    private Map<String, String> readGroup(List<String> keys) {
        Map<String, String> map = new LinkedHashMap<>();
        for (String fullKey : keys) {
            String shortKey = fullKey.substring(fullKey.lastIndexOf('.') + 1);
            String val = configService.getConfigValueOrDefault(fullKey, "");
            map.put(shortKey, val);
        }
        return map;
    }

    private Long getCallerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Long) return (Long) auth.getDetails();
        return null;
    }
}
