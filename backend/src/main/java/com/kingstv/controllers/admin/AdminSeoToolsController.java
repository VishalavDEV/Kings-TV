package com.kingstv.controllers.admin;

import com.kingstv.models.Article;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.services.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class AdminSeoToolsController {

    @Autowired private SystemConfigService configService;
    @Autowired private ArticleRepository articleRepository;

    @GetMapping("/api/admin/seo-tools")
    public ResponseEntity<?> getSeoTools() {
        Map<String, Object> seoSettings = new LinkedHashMap<>();
        seoSettings.put("siteTitle", configService.getConfigValueOrDefault("seo.site_title", "Kings TV"));
        seoSettings.put("homeTitle", configService.getConfigValueOrDefault("seo.home_title", "Kings TV - News & Entertainment"));
        seoSettings.put("siteDescription", configService.getConfigValueOrDefault("seo.site_description", "Leading Tamil and English News portal"));
        seoSettings.put("keywords", configService.getConfigValueOrDefault("seo.keywords", "news, tamil news, kings tv, breaking news"));
        seoSettings.put("googleAnalyticsCode", configService.getConfigValueOrDefault("seo.google_analytics_code", ""));

        Map<String, Object> sitemapSettings = new LinkedHashMap<>();
        sitemapSettings.put("frequency", configService.getConfigValueOrDefault("sitemap.frequency", "daily"));
        sitemapSettings.put("lastModification", configService.getConfigValueOrDefault("sitemap.last_modification", "server_response"));
        sitemapSettings.put("priority", configService.getConfigValueOrDefault("sitemap.priority", "auto"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("seoSettings", seoSettings);
        response.put("sitemapSettings", sitemapSettings);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/admin/seo-tools")
    public ResponseEntity<?> saveSeoTools(@RequestBody Map<String, Object> body) {
        if (body.containsKey("seoSettings")) {
            @SuppressWarnings("unchecked")
            Map<String, String> seo = (Map<String, String>) body.get("seoSettings");
            if (seo != null) {
                configService.setConfigValue("seo.site_title", seo.getOrDefault("siteTitle", ""), "seo", null, null);
                configService.setConfigValue("seo.home_title", seo.getOrDefault("homeTitle", ""), "seo", null, null);
                configService.setConfigValue("seo.site_description", seo.getOrDefault("siteDescription", ""), "seo", null, null);
                configService.setConfigValue("seo.keywords", seo.getOrDefault("keywords", ""), "seo", null, null);
                configService.setConfigValue("seo.google_analytics_code", seo.getOrDefault("googleAnalyticsCode", ""), "seo", null, null);
            }
        }

        if (body.containsKey("sitemapSettings")) {
            @SuppressWarnings("unchecked")
            Map<String, String> sitemap = (Map<String, String>) body.get("sitemapSettings");
            if (sitemap != null) {
                configService.setConfigValue("sitemap.frequency", sitemap.getOrDefault("frequency", "daily"), "sitemap", null, null);
                configService.setConfigValue("sitemap.last_modification", sitemap.getOrDefault("lastModification", "server_response"), "sitemap", null, null);
                configService.setConfigValue("sitemap.priority", sitemap.getOrDefault("priority", "auto"), "sitemap", null, null);
            }
        }

        return ResponseEntity.ok(Map.of("message", "SEO tools settings saved successfully"));
    }

    @PostMapping("/api/admin/seo-tools/generate-sitemap")
    public ResponseEntity<?> generateSitemap() {
        String result = generateSitemapXmlContent();
        return ResponseEntity.ok(Map.of(
            "message", "Sitemap generated successfully",
            "urlCount", articleRepository.count() + 10,
            "sitemapContent", result
        ));
    }

    @GetMapping(value = "/cron/update-sitemap", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> cronUpdateSitemap() {
        String xml = generateSitemapXmlContent();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "application/xml")
            .body(xml);
    }

    private String generateSitemapXmlContent() {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        sb.append("  <url><loc>https://kings-tv.vercel.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n");

        List<Article> articles = articleRepository.findAll();
        int maxLinks = Math.min(articles.size(), 50000);
        for (int i = 0; i < maxLinks; i++) {
            Article a = articles.get(i);
            sb.append("  <url><loc>https://kings-tv.vercel.app/article/").append(a.getSlug()).append("</loc>");
            sb.append("<changefreq>daily</changefreq><priority>0.8</priority></url>\n");
        }

        sb.append("</urlset>");
        return sb.toString();
    }
}
