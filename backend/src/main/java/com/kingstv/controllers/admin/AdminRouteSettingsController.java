package com.kingstv.controllers.admin;

import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/route-settings")
public class AdminRouteSettingsController {

    @Autowired private SystemConfigService configService;

    private static final Map<String, String> DEFAULT_ROUTES = Map.of(
        "posts", "posts",
        "search", "search",
        "rss_feeds", "rss-feeds",
        "gallery_album", "gallery-album",
        "earnings", "earnings",
        "payouts", "payouts",
        "set_payout_account", "set-payout-account",
        "logout", "logout"
    );

    @GetMapping
    public ResponseEntity<?> getRouteSettings() {
        Map<String, String> routes = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : DEFAULT_ROUTES.entrySet()) {
            String key = entry.getKey();
            String defVal = entry.getValue();
            String savedVal = configService.getConfigValueOrDefault("route." + key, defVal);
            routes.put(key, savedVal);
        }
        return ResponseEntity.ok(routes);
    }

    @PutMapping
    public ResponseEntity<?> saveRouteSettings(@RequestBody Map<String, String> payload) {
        for (Map.Entry<String, String> entry : payload.entrySet()) {
            String slug = entry.getValue();
            if (slug != null && !slug.matches("^[a-zA-Z0-9_-]+$")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid slug '" + slug + "' for route '" + entry.getKey() + "'. Special characters and spaces are not allowed!"
                ));
            }
        }

        for (Map.Entry<String, String> entry : payload.entrySet()) {
            configService.setConfigValue("route." + entry.getKey(), entry.getValue(), "route_settings", null, null);
        }

        return ResponseEntity.ok(Map.of("message", "Route settings saved successfully"));
    }
}
