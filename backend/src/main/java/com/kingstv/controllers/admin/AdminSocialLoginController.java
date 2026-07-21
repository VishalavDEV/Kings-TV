package com.kingstv.controllers.admin;

import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/social-login-config")
public class AdminSocialLoginController {

    @Autowired
    private SystemConfigService configService;

    @GetMapping
    public ResponseEntity<?> getSocialLoginConfigs() {
        Map<String, Object> res = new LinkedHashMap<>();

        Map<String, String> facebook = new LinkedHashMap<>();
        facebook.put("appId", configService.getConfigValueOrDefault("social.facebook.app_id", ""));
        facebook.put("appSecret", configService.getConfigValueOrDefault("social.facebook.app_secret", ""));

        Map<String, String> google = new LinkedHashMap<>();
        google.put("clientId", configService.getConfigValueOrDefault("social.google.client_id", ""));
        google.put("clientSecret", configService.getConfigValueOrDefault("social.google.client_secret", ""));

        Map<String, String> vkontakte = new LinkedHashMap<>();
        vkontakte.put("appId", configService.getConfigValueOrDefault("social.vk.app_id", ""));
        vkontakte.put("secureKey", configService.getConfigValueOrDefault("social.vk.secure_key", ""));

        res.put("facebook", facebook);
        res.put("google", google);
        res.put("vkontakte", vkontakte);

        return ResponseEntity.ok(res);
    }

    @PutMapping("/{provider}")
    public ResponseEntity<?> updateProviderConfig(@PathVariable String provider, @RequestBody Map<String, String> body) {
        String p = provider.toLowerCase();

        if ("facebook".equals(p)) {
            String appId = body.getOrDefault("appId", "");
            String appSecret = body.getOrDefault("appSecret", "");
            configService.setConfigValue("social.facebook.app_id", appId, "social_login", "Facebook App ID", null);
            configService.setConfigValue("social.facebook.app_secret", appSecret, "social_login", "Facebook App Secret", null);
            return ResponseEntity.ok(Map.of("message", "Facebook login settings saved successfully"));
        } else if ("google".equals(p)) {
            String clientId = body.getOrDefault("clientId", "");
            String clientSecret = body.getOrDefault("clientSecret", "");
            configService.setConfigValue("social.google.client_id", clientId, "social_login", "Google Client ID", null);
            configService.setConfigValue("social.google.client_secret", clientSecret, "social_login", "Google Client Secret", null);
            return ResponseEntity.ok(Map.of("message", "Google login settings saved successfully"));
        } else if ("vkontakte".equals(p) || "vk".equals(p)) {
            String appId = body.getOrDefault("appId", "");
            String secureKey = body.getOrDefault("secureKey", "");
            configService.setConfigValue("social.vk.app_id", appId, "social_login", "VKontakte App ID", null);
            configService.setConfigValue("social.vk.secure_key", secureKey, "social_login", "VKontakte Secure Key", null);
            return ResponseEntity.ok(Map.of("message", "VKontakte login settings saved successfully"));
        }

        return ResponseEntity.badRequest().body(Map.of("message", "Unsupported provider: " + provider));
    }
}
