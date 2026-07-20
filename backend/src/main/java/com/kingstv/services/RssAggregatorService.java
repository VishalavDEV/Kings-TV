package com.kingstv.services;

import com.kingstv.models.AggregatedNews;
import com.kingstv.repository.AggregatedNewsRepository;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class RssAggregatorService {

    private static final Logger LOGGER = Logger.getLogger(RssAggregatorService.class.getName());

    @Autowired
    private AggregatedNewsRepository aggregatedNewsRepository;

    private static class RssSource {
        String name;
        String logoUrl;
        String feedUrl;

        RssSource(String name, String logoUrl, String feedUrl) {
            this.name = name;
            this.logoUrl = logoUrl;
            this.feedUrl = feedUrl;
        }
    }

    private final List<RssSource> approvedSources = List.of(
        new RssSource("BBC News Tamil", "https://news.files.bbci.co.uk/ws/shared/img/lis/tamil.png", "https://feeds.bbci.co.uk/tamil/rss.xml"),
        new RssSource("The Hindu Tamil", "https://images.hindustantimes.com/images/ht-logo.svg", "https://www.hindutamil.in/rss/feed.php")
    );

    // Run automatically every 3 hours
    @Scheduled(cron = "0 0 */3 * * *")
    public void fetchAggregatedFeeds() {
        LOGGER.info("Starting scheduled RSS news aggregation ingestion job...");
        int totalIngested = 0;

        for (RssSource source : approvedSources) {
            try {
                LOGGER.info("Fetching RSS feed from: " + source.name + " (" + source.feedUrl + ")");
                java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(URI.create(source.feedUrl))
                    .GET()
                    .build();
                java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
                String xml = response.body();
                
                // Strip DOCTYPE declaration to prevent SAXParseException disallow-doctype-decl
                xml = xml.replaceAll("(?i)<!DOCTYPE[^>]*>", "");
                
                SyndFeedInput input = new SyndFeedInput();
                SyndFeed feed = input.build(new XmlReader(new java.io.ByteArrayInputStream(xml.getBytes(java.nio.charset.StandardCharsets.UTF_8))));

                int count = 0;
                for (SyndEntry entry : feed.getEntries()) {
                    String link = entry.getLink();
                    if (link == null || link.trim().isEmpty()) {
                        continue;
                    }

                    // Check if already aggregated
                    if (aggregatedNewsRepository.existsByExternalLink(link)) {
                        continue;
                    }

                    AggregatedNews item = new AggregatedNews();
                    item.setSourceName(source.name);
                    item.setSourceLogo(source.logoUrl);
                    item.setTitle(entry.getTitle() != null ? entry.getTitle().trim() : "Untitled");
                    
                    String desc = "";
                    if (entry.getDescription() != null) {
                        desc = entry.getDescription().getValue();
                    } else if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                        desc = entry.getContents().get(0).getValue();
                    }
                    item.setDescription(desc);
                    item.setExternalLink(link);
                    item.setNoindex(true); // Aggregated content is external-link only and flagged noindex for search engines

                    Date pubDate = entry.getPublishedDate();
                    if (pubDate != null) {
                        item.setPublishedTime(LocalDateTime.ofInstant(pubDate.toInstant(), ZoneId.systemDefault()));
                    } else {
                        item.setPublishedTime(LocalDateTime.now());
                    }

                    aggregatedNewsRepository.save(item);
                    count++;
                    totalIngested++;
                }
                LOGGER.info("Successfully ingested " + count + " new items from " + source.name);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Failed to ingest RSS feed from: " + source.name, e);
            }
        }
        LOGGER.info("RSS news aggregation completed. Total new items ingested: " + totalIngested);
    }

    public List<AggregatedNews> getLatestItems() {
        return aggregatedNewsRepository.findAll();
    }
}
