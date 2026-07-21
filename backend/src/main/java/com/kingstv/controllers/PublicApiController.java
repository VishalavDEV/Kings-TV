package com.kingstv.controllers;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import com.kingstv.services.SystemConfigService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {

    @Autowired private ArticleRepository articleRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private SubCategoryRepository subCategoryRepository;
    @Autowired private BreakingNewsRepository breakingNewsRepository;
    @Autowired private VideoContentRepository videoContentRepository;
    @Autowired private PhotoGalleryRepository photoGalleryRepository;
    @Autowired private PollRepository pollRepository;
    @Autowired private PageContentRepository pageContentRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private ContactRequestRepository contactRequestRepository;
    @Autowired private NewsletterSubscriberRepository newsletterSubscriberRepository;
    @Autowired private RewardSettingsRepository rewardSettingsRepository;
    @Autowired private PageviewLogRepository pageviewLogRepository;
    @Autowired private AuthorEarningRepository authorEarningRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SystemConfigService systemConfigService;
    @Autowired private PushNotificationRepository pushNotificationRepository;
    @Autowired private DeviceTokenRepository deviceTokenRepository;
    @Autowired private LiveChannelRepository liveChannelRepository;

    // --- 1. GET /api/public/articles ---
    @GetMapping("/articles")
    public ResponseEntity<?> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(page, limit, Sort.by("publishedAt").descending());
        
        Long catId = null;
        if (category != null && !category.isBlank()) {
            if (category.matches("^\\d+$")) {
                catId = Long.parseLong(category);
            } else {
                Optional<Category> c = categoryRepository.findBySlug(category);
                if (c.isPresent()) catId = c.get().getId();
            }
        }

        final Long filterCatId = catId;
        final String searchLower = (search != null) ? search.trim().toLowerCase() : null;

        Page<Article> articlesPage = articleRepository.findAll(
            (root, query, cb) -> {
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                predicates.add(cb.equal(root.get("status"), "published"));
                
                if (filterCatId != null) {
                    predicates.add(cb.equal(root.get("categoryId"), filterCatId));
                }
                if (language != null && !language.isBlank()) {
                    predicates.add(cb.equal(cb.lower(root.get("language")), language.toLowerCase()));
                }
                if (searchLower != null && !searchLower.isEmpty()) {
                    predicates.add(cb.or(
                        cb.like(cb.lower(root.get("titleTa")), "%" + searchLower + "%"),
                        cb.like(cb.lower(root.get("titleEn")), "%" + searchLower + "%"),
                        cb.like(cb.lower(root.get("contentTa")), "%" + searchLower + "%"),
                        cb.like(cb.lower(root.get("contentEn")), "%" + searchLower + "%")
                    ));
                }
                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            },
            pageable
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("articles", articlesPage.getContent());
        response.put("total", articlesPage.getTotalElements());
        response.put("page", page);
        response.put("totalPages", articlesPage.getTotalPages());
        return ResponseEntity.ok(response);
    }

    // --- 2. GET /api/public/articles/{slug} ---
    @GetMapping("/articles/{slug}")
    public ResponseEntity<?> getArticleBySlug(@PathVariable String slug) {
        Optional<Article> articleOpt = articleRepository.findBySlug(slug);
        if (articleOpt.isEmpty() && slug.matches("^\\d+$")) {
            articleOpt = articleRepository.findById(Long.parseLong(slug));
        }
        return articleOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 3. POST /api/public/track-view & POST /api/public/articles/{slug}/view ---
    @PostMapping({"/track-view", "/articles/{slug}/view"})
    public ResponseEntity<?> recordArticleView(
            @PathVariable(required = false) String slug,
            @RequestBody(required = false) Map<String, Object> body,
            HttpServletRequest request) {

        String targetSlug = slug;
        if ((targetSlug == null || targetSlug.isBlank()) && body != null) {
            if (body.get("slug") != null) targetSlug = body.get("slug").toString();
            else if (body.get("postId") != null) targetSlug = body.get("postId").toString();
            else if (body.get("articleId") != null) targetSlug = body.get("articleId").toString();
        }

        if (targetSlug == null || targetSlug.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "slug or postId required"));
        }

        Optional<Article> articleOpt = articleRepository.findBySlug(targetSlug);
        if (articleOpt.isEmpty() && targetSlug.matches("^\\d+$")) {
            articleOpt = articleRepository.findById(Long.parseLong(targetSlug));
        }

        if (articleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Article article = articleOpt.get();
        articleRepository.incrementViewsCount(article.getId());

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        // Reward system handling
        BigDecimal earningsAmount = BigDecimal.ZERO;
        List<RewardSettings> settingsList = rewardSettingsRepository.findAll();
        if (!settingsList.isEmpty() && "ENABLED".equalsIgnoreCase(settingsList.get(0).getStatus())) {
            RewardSettings rs = settingsList.get(0);
            BigDecimal ratePer1000 = rs.getRewardAmountPer1000Views() != null ? rs.getRewardAmountPer1000Views() : BigDecimal.ZERO;
            earningsAmount = ratePer1000.divide(new BigDecimal("1000"), 6, java.math.RoundingMode.HALF_UP);
        }

        Long authorId = null;
        if (article.getAuthorName() != null) {
            Optional<User> authorOpt = userRepository.findByEmail(article.getAuthorName().toLowerCase());
            if (authorOpt.isPresent()) {
                authorId = authorOpt.get().getId();
            } else {
                Optional<User> userByName = userRepository.findByFullName(article.getAuthorName());
                if (userByName.isPresent()) authorId = userByName.get().getId();
            }
        }

        // Log pageview
        PageviewLog pLog = new PageviewLog();
        pLog.setArticleId(article.getId());
        pLog.setArticleSlug(article.getSlug());
        pLog.setAuthorId(authorId);
        pLog.setAuthorName(article.getAuthorName());
        pLog.setIpAddress(ipAddress);
        pLog.setUserAgent(userAgent);
        pLog.setEarningsAmount(earningsAmount);
        pLog.setViewedAt(LocalDateTime.now());
        pageviewLogRepository.save(pLog);

        // Update author earnings
        if (authorId != null && earningsAmount.compareTo(BigDecimal.ZERO) > 0) {
            LocalDate today = LocalDate.now();
            Optional<AuthorEarning> existingEarning = authorEarningRepository.findByArticleIdAndEarnDate(article.getId(), today);
            if (existingEarning.isPresent()) {
                AuthorEarning ae = existingEarning.get();
                ae.setPageviewCount(ae.getPageviewCount() + 1);
                ae.setEarningsAmount(ae.getEarningsAmount().add(earningsAmount));
                authorEarningRepository.save(ae);
            } else {
                AuthorEarning ae = new AuthorEarning();
                ae.setAuthorId(authorId);
                ae.setAuthorName(article.getAuthorName());
                ae.setArticleId(article.getId());
                ae.setArticleTitle(article.getTitleEn() != null ? article.getTitleEn() : article.getTitleTa());
                ae.setArticleSlug(article.getSlug());
                ae.setPageviewCount(1L);
                ae.setEarningsAmount(earningsAmount);
                ae.setEarnDate(today);
                authorEarningRepository.save(ae);
            }
        }

        return ResponseEntity.ok(Map.of("message", "View logged", "articleId", article.getId()));
    }

    // --- 4. GET /api/public/categories ---
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        List<Category> all = categoryRepository.findAll();
        List<Category> active = all.stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .sorted(Comparator.comparingInt(c -> c.getDisplayOrder() != null ? c.getDisplayOrder() : 0))
                .collect(Collectors.toList());
        return ResponseEntity.ok(active);
    }

    // --- 5. GET /api/public/subcategories ---
    @GetMapping("/subcategories")
    public ResponseEntity<?> getSubcategories() {
        return ResponseEntity.ok(subCategoryRepository.findAll());
    }

    // --- 6. GET /api/public/breaking-news ---
    @GetMapping("/breaking-news")
    public ResponseEntity<?> getBreakingNews() {
        List<BreakingNews> all = breakingNewsRepository.findAll();
        List<BreakingNews> active = all.stream()
                .filter(bn -> "published".equalsIgnoreCase(bn.getStatus()) || Boolean.TRUE.equals(bn.getBreaking()))
                .sorted(Comparator.comparing(BreakingNews::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(active);
    }

    // --- 7. GET /api/public/slider ---
    @GetMapping("/slider")
    public ResponseEntity<?> getSliderArticles() {
        return ResponseEntity.ok(articleRepository.findTop50ByStatusOrderByPublishedAtDesc("published").stream().limit(5).toList());
    }

    // --- 8. GET /api/public/featured ---
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedArticles() {
        return ResponseEntity.ok(articleRepository.findTop50ByStatusOrderByPublishedAtDesc("published").stream().skip(5).limit(6).toList());
    }

    // --- 9. GET /api/public/recommended ---
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedArticles() {
        return ResponseEntity.ok(articleRepository.findTop5ByStatusOrderByViewsCountDesc("published"));
    }

    // --- 10. GET /api/public/videos ---
    @GetMapping("/videos")
    public ResponseEntity<?> getVideos() {
        List<VideoContent> all = videoContentRepository.findAll();
        List<VideoContent> published = all.stream()
                .filter(v -> "published".equalsIgnoreCase(v.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(published);
    }

    // --- 11. GET /api/public/gallery-albums ---
    @GetMapping("/gallery-albums")
    public ResponseEntity<?> getGalleryAlbums() {
        List<PhotoGallery> all = photoGalleryRepository.findAll();
        List<PhotoGallery> published = all.stream()
                .filter(g -> "published".equalsIgnoreCase(g.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(published);
    }

    // --- 12. GET /api/public/polls ---
    @GetMapping("/polls")
    public ResponseEntity<?> getPolls() {
        List<Poll> all = pollRepository.findAll();
        List<Poll> active = all.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(active);
    }

    // --- 13. GET /api/public/pages/{slug} ---
    @GetMapping("/pages/{slug}")
    public ResponseEntity<?> getPageBySlug(@PathVariable String slug) {
        return pageContentRepository.findById(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 14. POST /api/public/polls/{id}/vote ---
    @PostMapping("/polls/{id}/vote")
    public ResponseEntity<?> votePoll(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Optional<Poll> pollOpt = pollRepository.findById(id);
        if (pollOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Poll poll = pollOpt.get();
        Long optionId = null;
        if (body.get("optionId") != null) {
            optionId = Long.parseLong(body.get("optionId").toString());
        } else if (body.get("option") != null) {
            int index = Integer.parseInt(body.get("option").toString()) - 1;
            if (index >= 0 && index < poll.getOptions().size()) {
                optionId = poll.getOptions().get(index).getId();
            }
        }

        if (optionId != null) {
            for (com.kingstv.models.PollOption opt : poll.getOptions()) {
                if (opt.getId().equals(optionId)) {
                    opt.setVoteCount((opt.getVoteCount() != null ? opt.getVoteCount() : 0) + 1);
                    break;
                }
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or missing option parameter"));
        }

        poll.setVoteCount((poll.getVoteCount() != null ? poll.getVoteCount() : 0) + 1);
        pollRepository.save(poll);
        return ResponseEntity.ok(poll);
    }

    // --- 15. POST /api/public/comments ---
    @PostMapping("/comments")
    public ResponseEntity<?> createComment(@RequestBody Comment comment) {
        if (comment.getArticleId() == null || comment.getCommentText() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "articleId and commentText are required"));
        }
        if (comment.getCommentorName() == null || comment.getCommentorName().isBlank()) {
            comment.setCommentorName("Anonymous");
        }
        comment.setCreatedAt(LocalDateTime.now());
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Comment submitted", "comment", saved));
    }

    // --- 16. POST /api/public/contact & POST /api/public/contact-messages ---
    @PostMapping({"/contact", "/contact-messages"})
    public ResponseEntity<?> createContactMessage(@RequestBody ContactRequest contactRequest) {
        if (contactRequest.getName() == null || contactRequest.getEmail() == null || contactRequest.getMessage() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "name, email, and message are required"));
        }
        contactRequest.setStatus("new");
        ContactRequest saved = contactRequestRepository.save(contactRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Contact request sent successfully", "id", saved.getId()));
    }

    // --- 17. POST /api/public/newsletter/subscribe ---
    @PostMapping("/newsletter/subscribe")
    public ResponseEntity<?> subscribeNewsletter(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        Optional<NewsletterSubscriber> existing = newsletterSubscriberRepository.findByEmail(email.toLowerCase());
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("message", "You are already subscribed!"));
        }

        NewsletterSubscriber sub = new NewsletterSubscriber();
        sub.setEmail(email.toLowerCase());
        sub.setName(name != null ? name : "");
        sub.setStatus("active");
        sub.setVerified(true);
        newsletterSubscriberRepository.save(sub);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Successfully subscribed to newsletter!"));
    }

    // --- 18. GET /api/public/settings ---
    @GetMapping("/settings")
    public ResponseEntity<?> getPublicSettings() {
        Map<String, Object> settings = new LinkedHashMap<>();

        // Site General & Visual settings
        String siteName = systemConfigService.getConfigValueOrDefault("general.site_title", "Kings TV");
        String siteTagline = systemConfigService.getConfigValueOrDefault("general.site_tagline", "Tamil News & Media Portal");
        String logoUrl = systemConfigService.getConfigValueOrDefault("visual.logo_url", "");
        String logoFooterUrl = systemConfigService.getConfigValueOrDefault("visual.logo_footer_url", "");
        String logoEmailUrl = systemConfigService.getConfigValueOrDefault("visual.logo_email_url", "");
        String siteColor = systemConfigService.getConfigValueOrDefault("visual.site_color", "#B3732A");
        String headerColor = systemConfigService.getConfigValueOrDefault("visual.header_color", "#1e1e2d");
        String postListStyle = systemConfigService.getConfigValueOrDefault("visual.post_list_style", "vertical");

        // Maintenance Mode
        String maintEnabledStr = systemConfigService.getConfigValueOrDefault("general.maintenance.enabled", "false");
        boolean maintenanceMode = "true".equalsIgnoreCase(maintEnabledStr) || "1".equals(maintEnabledStr);
        String maintTitle = systemConfigService.getConfigValueOrDefault("general.maintenance.title", "Under Maintenance");
        String maintMsg = systemConfigService.getConfigValueOrDefault("general.maintenance.message", "We will be back shortly!");

        // Social links
        Map<String, String> social = new LinkedHashMap<>();
        social.put("facebook", systemConfigService.getConfigValueOrDefault("general.social.facebook", ""));
        social.put("twitter", systemConfigService.getConfigValueOrDefault("general.social.twitter", ""));
        social.put("instagram", systemConfigService.getConfigValueOrDefault("general.social.instagram", ""));
        social.put("youtube", systemConfigService.getConfigValueOrDefault("general.social.youtube", ""));
        social.put("telegram", systemConfigService.getConfigValueOrDefault("general.social.telegram", ""));
        social.put("linkedin", systemConfigService.getConfigValueOrDefault("general.social.linkedin", ""));

        // Contact info
        Map<String, String> contact = new LinkedHashMap<>();
        contact.put("address", systemConfigService.getConfigValueOrDefault("general.contact.address", ""));
        contact.put("phone", systemConfigService.getConfigValueOrDefault("general.contact.phone", ""));
        contact.put("email", systemConfigService.getConfigValueOrDefault("general.contact.email", ""));
        contact.put("mapEmbedUrl", systemConfigService.getConfigValueOrDefault("general.contact.map_embed_url", ""));

        settings.put("siteName", siteName);
        settings.put("siteTagline", siteTagline);
        settings.put("logoUrl", logoUrl);
        settings.put("logoFooterUrl", logoFooterUrl);
        settings.put("logoEmailUrl", logoEmailUrl);
        settings.put("siteColor", siteColor);
        settings.put("headerColor", headerColor);
        settings.put("postListStyle", postListStyle);
        settings.put("maintenanceMode", maintenanceMode);
        settings.put("maintenanceTitle", maintTitle);
        settings.put("maintenanceMessage", maintMsg);
        settings.put("social", social);
        settings.put("contact", contact);

        return ResponseEntity.ok(settings);
    }

    // --- 19. GET /api/public/maintenance-status ---
    @GetMapping("/maintenance-status")
    public ResponseEntity<?> getMaintenanceStatus() {
        String maintEnabledStr = systemConfigService.getConfigValueOrDefault("general.maintenance.enabled", "false");
        boolean maintenanceMode = "true".equalsIgnoreCase(maintEnabledStr) || "1".equals(maintEnabledStr);
        String maintTitle = systemConfigService.getConfigValueOrDefault("general.maintenance.title", "Under Maintenance");
        String maintMsg = systemConfigService.getConfigValueOrDefault("general.maintenance.message", "We will be back shortly!");
        return ResponseEntity.ok(Map.of(
            "maintenance", maintenanceMode,
            "title", maintTitle,
            "message", maintMsg
        ));
    }

    // --- 20. GET /api/public/layout/web ---
    @GetMapping("/layout/web")
    public ResponseEntity<?> getWebLayout() {
        String layoutJson = systemConfigService.getConfigValueOrDefault("general.homepage_layout", "");
        if (layoutJson != null && !layoutJson.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("layout", layoutJson));
        }
        return ResponseEntity.ok(Map.of("layout", "[{\"id\":\"Featured\",\"active\":true},{\"id\":\"Latest\",\"active\":true},{\"id\":\"Breaking Ticker\",\"active\":true},{\"id\":\"Institution News\",\"active\":true},{\"id\":\"Nearby/District feed\",\"active\":true},{\"id\":\"Classifieds row\",\"active\":true},{\"id\":\"Market Ticker\",\"active\":true},{\"id\":\"Live TV embed\",\"active\":true}]"));
    }
    @PostMapping("/device-tokens")
    public ResponseEntity<?> registerDeviceToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
        }
        
        Optional<DeviceToken> existing = deviceTokenRepository.findByToken(token);
        DeviceToken deviceToken = existing.orElse(new DeviceToken());
        deviceToken.setToken(token);
        
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Long) {
            deviceToken.setUserId((Long) auth.getDetails());
        }
        
        deviceTokenRepository.save(deviceToken);
        return ResponseEntity.ok(Map.of("message", "Device token registered successfully"));
    }

    @GetMapping("/livestream/active")
    public ResponseEntity<List<LiveChannel>> getActiveStreams() {
        return ResponseEntity.ok(liveChannelRepository.findByIsActive(true));
    }

    @PostMapping("/push-notifications/{id}/click")
    public ResponseEntity<?> recordPushClick(@PathVariable Long id) {
        return pushNotificationRepository.findById(id).map(record -> {
            record.setOpenedCount((record.getOpenedCount() != null ? record.getOpenedCount() : 0) + 1);
            pushNotificationRepository.save(record);
            return ResponseEntity.ok(Map.of("message", "Click logged successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
