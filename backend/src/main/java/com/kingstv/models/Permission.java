package com.kingstv.models;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String module;

    public Permission() {}

    public Permission(String name, String description, String module) {
        this.name = name;
        this.description = description;
        this.module = module;
    }

    // Permission name constants
    // User management
    public static final String USER_CREATE = "user:create";
    public static final String USER_READ = "user:read";
    public static final String USER_UPDATE = "user:update";
    public static final String USER_DELETE = "user:delete";
    public static final String USER_SUSPEND = "user:suspend";

    // Article / Content
    public static final String ARTICLE_CREATE = "article:create";
    public static final String ARTICLE_READ = "article:read";
    public static final String ARTICLE_UPDATE = "article:update";
    public static final String ARTICLE_DELETE = "article:delete";
    public static final String ARTICLE_PUBLISH = "article:publish";
    public static final String ARTICLE_REVIEW = "article:review";

    // Audit
    public static final String AUDIT_VIEW = "audit:view";

    // System config
    public static final String CONFIG_READ = "config:read";
    public static final String CONFIG_WRITE = "config:write";

    // Profanity
    public static final String PROFANITY_MANAGE = "profanity:manage";
    public static final String PROFANITY_VIEW_REPORTS = "profanity:view_reports";

    // Home layout
    public static final String HOME_LAYOUT_MANAGE = "home_layout:manage";
    public static final String HOME_LAYOUT_DELEGATED = "home_layout:delegated";

    // Push notifications
    public static final String PUSH_NOTIFICATION_SEND = "push_notification:send";

    // SEO
    public static final String SEO_CONFIG_MANAGE = "seo_config:manage";

    // Taxonomy
    public static final String TAXONOMY_MANAGE = "taxonomy:manage";

    // Survey/Poll
    public static final String SURVEY_MANAGE = "survey:manage";

    // Webstore
    public static final String WEBSTORE_MANAGE = "webstore:manage";

    // Font config
    public static final String FONT_MANAGE = "font:manage";

    // Sitemap
    public static final String SITEMAP_MANAGE = "sitemap:manage";

    // Mobile App Layout
    public static final String MOBILE_APP_LAYOUT_MANAGE = "mobile_app_layout:manage";

    // District Admin specifics
    public static final String JOURNALIST_CREATE = "journalist:create";
    public static final String JOURNALIST_UPDATE = "journalist:update";
    public static final String JOURNALIST_SUSPEND = "journalist:suspend";

    // Content review
    public static final String CONTENT_REVIEW = "content:review";
    public static final String UGC_REVIEW = "ugc:review";

    // Analytics
    public static final String ANALYTICS_VIEW = "analytics:view";

    // AI Rewriter
    public static final String AI_REWRITER_USE = "ai_rewriter:use";

    // Article unpublish (District Admin can unpublish but not hard-delete)
    public static final String ARTICLE_UNPUBLISH = "article:unpublish";

    // Analytics — district-scoped variant
    public static final String ANALYTICS_DISTRICT_ONLY = "analytics:district_only";

    // Module-key permissions for sidebar visibility
    public static final String MODULE_ADMIN_PANEL = "admin_panel";
    public static final String MODULE_ADD_POST = "add_post";
    public static final String MODULE_MANAGE_ALL_POSTS = "manage_all_posts";
    public static final String MODULE_NAVIGATION = "navigation";
    public static final String MODULE_PAGES = "pages";
    public static final String MODULE_RSS_FEEDS = "rss_feeds";
    public static final String MODULE_CATEGORIES = "categories";
    public static final String MODULE_WIDGETS = "widgets";
    public static final String MODULE_POLLS = "polls";
    public static final String MODULE_GALLERY = "gallery";
    public static final String MODULE_COMMENTS = "comments";
    public static final String MODULE_CONTACT_MESSAGES = "contact_messages";
    public static final String MODULE_NEWSLETTER = "newsletter";
    public static final String MODULE_REWARD_SYSTEM = "reward_system";
    public static final String MODULE_AD_SPACES = "ad_spaces";
    public static final String MODULE_USERS = "users";
    public static final String MODULE_ROLES_PERMISSIONS = "roles_permissions";
    public static final String MODULE_SEO_TOOLS = "seo_tools";
    public static final String MODULE_SOCIAL_LOGIN = "social_login";
    public static final String MODULE_LANGUAGES = "languages";
    public static final String MODULE_SETTINGS = "settings";
    public static final String MODULE_CONTENT_REVIEW = "content_review";
    public static final String MODULE_MY_CONTENT = "my_content";
    public static final String MODULE_MEDIA_LIBRARY = "media_library";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
}
