package com.kingstv.controllers.admin;

import com.kingstv.models.Theme;
import com.kingstv.repository.ThemeRepository;
import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/themes")
public class AdminThemeController {

    @Autowired
    private ThemeRepository themeRepository;

    @Autowired
    private SystemConfigService configService;

    private void seedThemesIfEmpty() {
        if (themeRepository.count() == 0) {
            themeRepository.saveAll(Arrays.asList(
                new Theme("theme-default", "Light Glassmorphism", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80", true),
                new Theme("theme-dark", "Slate Obsidian Dark", "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80", false),
                new Theme("theme-crimson", "Royal Crimson Red", "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80", false),
                new Theme("theme-emerald", "Emerald Forest Green", "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80", false)
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> getThemes() {
        seedThemesIfEmpty();
        
        List<Theme> themes = themeRepository.findAll();
        String activeThemeId = configService.getConfigValue("active_theme_id");
        if (activeThemeId == null || activeThemeId.isEmpty()) {
            activeThemeId = "theme-default";
        }

        for (Theme t : themes) {
            t.setIsActive(t.getId().equals(activeThemeId));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("themes", themes);
        response.put("activeThemeId", activeThemeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateTheme(@PathVariable String id) {
        seedThemesIfEmpty();
        
        Optional<Theme> themeOpt = themeRepository.findById(id);
        if (themeOpt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Theme not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        List<Theme> allThemes = themeRepository.findAll();
        for (Theme t : allThemes) {
            t.setIsActive(t.getId().equals(id));
            themeRepository.save(t);
        }

        configService.setConfigValue("active_theme_id", id, "appearance", "Active site design theme key", 1L);
        
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Theme activated successfully");
        res.put("activeThemeId", id);
        return ResponseEntity.ok(res);
    }
}
