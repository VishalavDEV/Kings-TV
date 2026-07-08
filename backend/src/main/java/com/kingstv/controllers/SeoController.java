package com.kingstv.controllers;

import com.kingstv.models.Article;
import com.kingstv.models.Category;
import com.kingstv.models.VideoContent;
import com.kingstv.models.PdfContent;
import com.kingstv.repository.ArticleRepository;
import com.kingstv.repository.CategoryRepository;
import com.kingstv.repository.VideoContentRepository;
import com.kingstv.repository.PdfRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class SeoController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VideoContentRepository videoRepository;

    @Autowired
    private PdfRepository pdfRepository;

    private String getFrontendBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        
        String portStr = "";
        if (port == 5000) {
            portStr = ":5173"; // Map to frontend Vite dev server locally
        } else if (port != 80 && port != 443) {
            portStr = ":" + port;
        }
        return scheme + "://" + serverName + portStr;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap(HttpServletRequest request) {
        String baseUrl = getFrontendBaseUrl(request);
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Static Pages
        String[] staticPages = { "", "/login", "/directory", "/classifieds", "/wishes", "/obituaries", "/jobs", "/business-studies", "/videos", "/web-stories" };
        for (String path : staticPages) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append(path).append("</loc>\n");
            xml.append("    <changefreq>daily</changefreq>\n");
            xml.append("    <priority>").append(path.isEmpty() ? "1.0" : "0.7").append("</priority>\n");
            xml.append("  </url>\n");
        }

        // Categories
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append("/category/").append(cat.getSlug()).append("</loc>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        // Articles (Published only)
        List<Article> articles = articleRepository.findByStatusOrderByPublishedAtDesc("published");
        for (Article art : articles) {
            String articleSlug = art.getSlug() != null ? art.getSlug() : String.valueOf(art.getId());
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append("/news/").append(articleSlug).append("</loc>\n");
            if (art.getUpdatedAt() != null) {
                ZonedDateTime zdt = art.getUpdatedAt().atZone(ZoneId.systemDefault());
                xml.append("    <lastmod>").append(zdt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)).append("</lastmod>\n");
            }
            xml.append("    <changefreq>monthly</changefreq>\n");
            xml.append("    <priority>0.9</priority>\n");
            xml.append("  </url>\n");
        }

        // Videos
        List<VideoContent> videos = videoRepository.findAll();
        for (VideoContent vid : videos) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append("/videos</loc>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.6</priority>\n");
            xml.append("  </url>\n");
        }

        // PDFs
        List<PdfContent> pdfs = pdfRepository.findAll();
        for (PdfContent pdf : pdfs) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append(pdf.getPdfUrl()).append("</loc>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.5</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    @GetMapping(value = "/rss.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getRssFeed(HttpServletRequest request) {
        String baseUrl = getFrontendBaseUrl(request);
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2002/Atom\">\n");
        xml.append("  <channel>\n");
        xml.append("    <title>KINGS 24x7 - தமிழ் செய்திகள் | Tamil News Portal</title>\n");
        xml.append("    <link>").append(baseUrl).append("</link>\n");
        xml.append("    <description>Kings TV News feed for Google News and search indexes</description>\n");
        xml.append("    <language>ta</language>\n");

        List<Article> articles = articleRepository.findByStatusOrderByPublishedAtDesc("published");
        if (!articles.isEmpty() && articles.get(0).getPublishedAt() != null) {
            ZonedDateTime buildDate = articles.get(0).getPublishedAt().atZone(ZoneId.systemDefault());
            xml.append("    <lastBuildDate>").append(buildDate.format(DateTimeFormatter.RFC_1123_DATE_TIME)).append("</lastBuildDate>\n");
        }

        for (Article art : articles) {
            String articleSlug = art.getSlug() != null ? art.getSlug() : String.valueOf(art.getId());
            xml.append("    <item>\n");
            xml.append("      <title><![CDATA[").append(art.getTitleTa()).append("]]></title>\n");
            xml.append("      <link>").append(baseUrl).append("/news/").append(articleSlug).append("</link>\n");
            xml.append("      <guid isPermaLink=\"true\">").append(baseUrl).append("/news/").append(articleSlug).append("</guid>\n");
            
            String desc = art.getShortDescTa() != null ? art.getShortDescTa() : art.getContentTa();
            if (desc != null) {
                if (desc.length() > 300) {
                    desc = desc.substring(0, 297) + "...";
                }
                xml.append("      <description><![CDATA[").append(desc).append("]]></description>\n");
            }
            
            if (art.getPublishedAt() != null) {
                ZonedDateTime pubDate = art.getPublishedAt().atZone(ZoneId.systemDefault());
                xml.append("      <pubDate>").append(pubDate.format(DateTimeFormatter.RFC_1123_DATE_TIME)).append("</pubDate>\n");
            }
            
            xml.append("      <author>").append(art.getAuthorName() != null ? art.getAuthorName() : "Kings TV News Desk").append("</author>\n");
            xml.append("    </item>\n");
        }

        xml.append("  </channel>\n");
        xml.append("</rss>");
        return xml.toString();
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getRobotsTxt(HttpServletRequest request) {
        String baseUrl = getFrontendBaseUrl(request);
        return "User-agent: *\n" +
                "Allow: /\n" +
                "Disallow: /api/v1/auth/\n" +
                "Disallow: /admin/\n\n" +
                "Sitemap: " + baseUrl + "/sitemap.xml\n";
    }
}
