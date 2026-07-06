package com.kingstv.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/home")
public class HomeController {

    @GetMapping
    public Map<String, Object> getHomeInfo() {
        return Map.of(
            "siteName", "KINGS 24x7",
            "tagline", "LIVE • TRUE • TAMIL",
            "welcomeMessage", "Welcome to Kings TV Tamil News Portal",
            "activeUsers", 1250,
            "breakingNews", "தமிழக பட்ஜெட் 2026 முக்கிய அம்சங்கள் அறிவிப்பு."
        );
    }
}
