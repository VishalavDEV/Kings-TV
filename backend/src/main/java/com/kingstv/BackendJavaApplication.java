package com.kingstv;

import com.kingstv.repository.ClassifiedCategoryRepository;
import com.kingstv.models.ClassifiedCategory;
import com.kingstv.repository.ClassifiedSubcategoryRepository;
import com.kingstv.models.ClassifiedSubcategory;

import com.kingstv.repository.JobCategoryRepository;
import com.kingstv.models.JobCategory;
import com.kingstv.repository.CompanyRepository;
import com.kingstv.models.Company;

import com.kingstv.repository.ObituaryFrameTemplateRepository;
import com.kingstv.models.ObituaryFrameTemplate;

import com.kingstv.models.Permission;
import com.kingstv.models.Role;
import com.kingstv.models.User;
import com.kingstv.models.AiPromptTemplate;
import com.kingstv.repository.PermissionRepository;
import com.kingstv.repository.RoleRepository;
import com.kingstv.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BackendJavaApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.kingstv.repository.WishCategoryRepository wishCategoryRepository;

    @Autowired
    private com.kingstv.repository.WishFrameTemplateRepository wishFrameTemplateRepository;

    @Autowired
    private ObituaryFrameTemplateRepository obituaryFrameTemplateRepository;

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @Autowired
    private ClassifiedCategoryRepository classifiedCategoryRepository;

    @Autowired
    private ClassifiedSubcategoryRepository classifiedSubcategoryRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private com.kingstv.repository.AiPromptTemplateRepository promptRepo;

    public static void main(String[] args) {
        System.setOut(new com.kingstv.services.MaskingPrintStream(System.out, System.out));
        System.setErr(new com.kingstv.services.MaskingPrintStream(System.err, System.err));
        SpringApplication.run(BackendJavaApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        ensureAdminUser("admin@king24x7.com", "admin123");
        ensureAdminUser("admin@kingstv.com", "admin123");

        seedRolesAndPermissions();
        seedCategories();
        seedFrameTemplates();
        seedObituaryFrameTemplates();
        seedJobCategoriesAndCompanies();
        seedClassifiedCategoriesAndSubcategories();
        seedAiPromptTemplates();
    }

    private void seedCategories() {
        if (wishCategoryRepository.count() == 0) {
            saveCategory("birthday", "Birthday", "பிறந்தநாள்", "fa-birthday-cake", "bg-pink-50 text-pink-500");
            saveCategory("anniversary", "Anniversary", "திருமண ஆண்டு", "fa-heart", "bg-red-50 text-red-500");
            saveCategory("wedding", "Wedding", "திருமணம்", "fa-ring", "bg-rose-50 text-rose-500");
            saveCategory("achievement", "Achievement", "சாதனை", "fa-trophy", "bg-yellow-50 text-yellow-500");
            saveCategory("graduation", "Graduation", "படிப்பு சாதனை", "fa-graduation-cap", "bg-indigo-50 text-indigo-500");
            saveCategory("festival", "Festival", "விழா வாழ்த்து", "fa-star", "bg-orange-50 text-orange-500");
            saveCategory("house-warming", "House Warming", "வீடு புகுவிழா", "fa-home", "bg-teal-50 text-teal-500");
            saveCategory("retirement", "Retirement", "ஓய்வு பெறுதல்", "fa-user-tie", "bg-blue-50 text-blue-500");
            saveCategory("newborn", "Newborn", "புதிய குழந்தை", "fa-baby", "bg-cyan-50 text-cyan-500");
            saveCategory("general", "General", "பொது வாழ்த்து", "fa-smile", "bg-gray-50 text-gray-500");
            System.out.println("Default wish categories seeded.");
        }
    }

    private void saveCategory(String slug, String name, String nameTa, String icon, String color) {
        com.kingstv.models.WishCategory cat = new com.kingstv.models.WishCategory();
        cat.setSlug(slug);
        cat.setName(name);
        cat.setNameTa(nameTa);
        cat.setIcon(icon);
        cat.setColor(color);
        wishCategoryRepository.save(cat);
    }

    private void seedFrameTemplates() {
        if (wishFrameTemplateRepository.count() == 0) {
            saveTemplate("birthday-frame", "Birthday Frame", "#ec4899", "#ec4899");
            saveTemplate("anniversary-frame", "Anniversary Frame", "#ef4444", "#ef4444");
            saveTemplate("graduation-frame", "Graduation Frame", "#6366f1", "#6366f1");
            saveTemplate("achievement-frame", "Achievement Frame", "#eab308", "#eab308");
            System.out.println("Default wish frame templates seeded.");
        }
    }

    private void saveTemplate(String slug, String name, String borderColor, String textColor) {
        com.kingstv.models.WishFrameTemplate t = new com.kingstv.models.WishFrameTemplate();
        t.setSlug(slug);
        t.setName(name);
        t.setBorderColor(borderColor);
        t.setTextColor(textColor);
        wishFrameTemplateRepository.save(t);
    }

    private void ensureAdminUser(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setFullName("Super Administrator");
            user.setCreatedAt(java.time.LocalDateTime.now());
        }
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole("SUPER_ADMIN");
        user.setIsActive(true);
        userRepository.save(user);
        System.out.println("Admin credentials ensured for " + email + " with password: " + rawPassword);
    }


    private void seedObituaryFrameTemplates() {
        if (obituaryFrameTemplateRepository.count() == 0) {
            saveObitTemplate("floral", "Floral Frame");
            saveObitTemplate("golden", "Golden Frame");
            saveObitTemplate("traditional", "Traditional Frame");
            saveObitTemplate("white", "White Memorial Frame");
            saveObitTemplate("premium", "Premium Frame");
            System.out.println("Default obituary frame templates seeded.");
        }
    }

    private void saveObitTemplate(String category, String name) {
        ObituaryFrameTemplate t = new ObituaryFrameTemplate();
        t.setCategory(category);
        t.setName(name);
        t.setIsActive(true);
        t.setDisplayOrder(0);
        obituaryFrameTemplateRepository.save(t);
    }


    private void seedJobCategoriesAndCompanies() {
        if (jobCategoryRepository.count() == 0) {
            saveJobCategory("IT & Software", "it-software", "fa-laptop-code", 2845, 120);
            saveJobCategory("Sales & Marketing", "sales-marketing", "fa-bullhorn", 4126, 180);
            saveJobCategory("Education", "education", "fa-book-reader", 3245, 95);
            saveJobCategory("Healthcare", "healthcare", "fa-heartbeat", 2087, 60);
            saveJobCategory("Engineering", "engineering", "fa-cog", 3789, 140);
            saveJobCategory("Government", "government", "fa-landmark", 1678, 20);
            saveJobCategory("Banking & Finance", "banking-finance", "fa-money-check-alt", 2345, 75);
            saveJobCategory("Others", "others", "fa-th-large", 5678, 300);
            System.out.println("Default job categories seeded.");
        }

        if (companyRepository.count() == 0) {
            saveCompany("Tata Consultancy Services", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100", "Coimbatore, Tamil Nadu", "it");
            saveCompany("Zoho Corporation", "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100", "Chennai, Tamil Nadu", "it");
            saveCompany("HDFC Bank", "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100", "Salem, Tamil Nadu", "finance");
            saveCompany("Apollo Hospitals", "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100", "Trichy, Tamil Nadu", "healthcare");
            System.out.println("Default companies seeded.");
        }
    }

    private void saveJobCategory(String name, String slug, String icon, int jobs, int companies) {
        JobCategory c = new JobCategory();
        c.setName(name);
        c.setSlug(slug);
        c.setIcon(icon);
        c.setActiveJobCount(jobs);
        c.setCompaniesHiringCount(companies);
        jobCategoryRepository.save(c);
    }

    private void saveCompany(String name, String logo, String address, String industry) {
        Company c = new Company();
        c.setCompanyName(name);
        c.setLogo(logo);
        c.setAddress(address);
        c.setIndustry(industry);
        c.setVerified(true);
        companyRepository.save(c);
    }


    private void seedClassifiedCategoriesAndSubcategories() {
        if (classifiedCategoryRepository.count() == 0) {
            ClassifiedCategory v = saveClassifiedCategory("Vehicles", "vehicles", "fa-car", 12458);
            saveClassifiedSubcat(v, "Cars", "cars");
            saveClassifiedSubcat(v, "Bikes", "bikes");

            ClassifiedCategory p = saveClassifiedCategory("Property", "property", "fa-home", 8923);
            saveClassifiedSubcat(p, "Apartments", "apartments");
            saveClassifiedSubcat(p, "Houses", "houses");

            ClassifiedCategory m = saveClassifiedCategory("Mobiles & Tablets", "mobiles-tablets", "fa-mobile-alt", 15267);
            saveClassifiedSubcat(m, "Mobiles", "mobiles");
            saveClassifiedSubcat(m, "Tablets", "tablets");

            ClassifiedCategory e = saveClassifiedCategory("Electronics", "electronics", "fa-laptop", 6482);
            saveClassifiedSubcat(e, "Laptops", "laptops");
            saveClassifiedSubcat(e, "TVs", "tvs");

            ClassifiedCategory h = saveClassifiedCategory("Home & Furniture", "home-furniture", "fa-couch", 7351);
            saveClassifiedSubcat(h, "Furniture", "furniture");
            saveClassifiedSubcat(h, "Home Appliances", "appliances");

            ClassifiedCategory f = saveClassifiedCategory("Fashion & Lifestyle", "fashion-lifestyle", "fa-tshirt", 5632);
            saveClassifiedSubcat(f, "Clothing", "clothing");

            ClassifiedCategory s = saveClassifiedCategory("Services", "services", "fa-tools", 9845);
            saveClassifiedSubcat(s, "Electrician", "electrician");

            ClassifiedCategory j = saveClassifiedCategory("Jobs", "jobs", "fa-briefcase", 2341);
            ClassifiedCategory pets = saveClassifiedCategory("Pets & Animals", "pets-animals", "fa-paw", 1254);
            ClassifiedCategory b = saveClassifiedCategory("Books & Education", "books-education", "fa-book", 3278);
            ClassifiedCategory ag = saveClassifiedCategory("Agriculture", "agriculture", "fa-tractor", 1987);
            ClassifiedCategory bi = saveClassifiedCategory("Business & Industrial", "business-industrial", "fa-industry", 2156);
            ClassifiedCategory hs = saveClassifiedCategory("Hobbies & Sports", "hobbies-sports", "fa-running", 2315);

            System.out.println("Default classified categories seeded.");
        }
    }

    private ClassifiedCategory saveClassifiedCategory(String name, String slug, String icon, int count) {
        ClassifiedCategory c = new ClassifiedCategory();
        c.setName(name);
        c.setSlug(slug);
        c.setIconClass(icon);
        c.setActiveAdCount(count);
        return classifiedCategoryRepository.save(c);
    }

    private void saveClassifiedSubcat(ClassifiedCategory cat, String name, String slug) {
        ClassifiedSubcategory s = new ClassifiedSubcategory();
        s.setCategory(cat);
        s.setName(name);
        s.setSlug(slug);
        classifiedSubcategoryRepository.save(s);
    }

    /**
     * Seeds the 6-tier role hierarchy and all permissions.
     * Idempotent — skips permissions/roles that already exist.
     */
    private void seedRolesAndPermissions() {
        // ── 1. Seed all permissions ──────────────────────────────────────
        String[][] allPermissions = {
            // {name, description, module}
            // User Management
            {"user:create",          "Create user accounts",             "User Management"},
            {"user:read",            "View user accounts",              "User Management"},
            {"user:update",          "Edit user accounts",              "User Management"},
            {"user:delete",          "Delete user accounts",            "User Management"},
            {"user:suspend",         "Suspend user accounts",           "User Management"},
            // Content
            {"article:create",       "Create articles/posts",           "Content"},
            {"article:read",         "View articles/posts",             "Content"},
            {"article:update",       "Edit articles/posts",             "Content"},
            {"article:delete",       "Delete articles/posts",           "Content"},
            {"article:publish",      "Publish articles/posts",          "Content"},
            {"article:review",       "Review submitted articles",       "Content"},
            {"article:unpublish",    "Unpublish articles (soft-delete)","Content"},
            // Moderation
            {"content:review",       "Review content queue",            "Moderation"},
            {"ugc:review",           "Review user-generated content",   "Moderation"},
            {"profanity:manage",     "Manage profanity filter",         "Moderation"},
            {"profanity:view_reports","View profanity reports",         "Moderation"},
            // Layout
            {"home_layout:manage",      "Manage home page layout",     "Layout"},
            {"home_layout:delegated",   "Delegated layout access",     "Layout"},
            {"mobile_app_layout:manage","Manage mobile app layout",    "Layout"},
            // Notifications
            {"push_notification:send",  "Send push notifications",     "Notifications"},
            // Polls & Surveys
            {"survey:manage",        "Manage polls and surveys",        "Polls"},
            // Analytics
            {"analytics:view",       "View full analytics",             "Analytics"},
            {"analytics:district_only","View district-scoped analytics","Analytics"},
            // System
            {"config:read",          "Read system configuration",       "System"},
            {"config:write",         "Write system configuration",      "System"},
            {"audit:view",           "View audit logs",                 "System"},
            {"seo_config:manage",    "Manage SEO configuration",        "System"},
            {"sitemap:manage",       "Manage sitemap",                  "System"},
            {"taxonomy:manage",      "Manage taxonomy/tags",            "System"},
            {"font:manage",          "Manage font configuration",       "System"},
            {"webstore:manage",      "Manage webstore",                 "System"},
            // Journalist management
            {"journalist:create",    "Create journalist accounts",      "Journalist"},
            {"journalist:update",    "Update journalist accounts",      "Journalist"},
            {"journalist:suspend",   "Suspend journalist accounts",     "Journalist"},
            // AI
            {"ai_rewriter:use",      "Use AI content rewriter",         "AI Tools"},
            // Module-key permissions (sidebar visibility)
            {"admin_panel",          "Access admin dashboard",          "Modules"},
            {"add_post",             "Access add post page",            "Modules"},
            {"manage_all_posts",     "Access all posts management",     "Modules"},
            {"navigation",           "Access navigation management",    "Modules"},
            {"pages",                "Access pages management",         "Modules"},
            {"rss_feeds",            "Access RSS feeds management",     "Modules"},
            {"categories",           "Access categories management",    "Modules"},
            {"widgets",              "Access widgets management",       "Modules"},
            {"polls",                "Access polls management",         "Modules"},
            {"gallery",              "Access gallery management",       "Modules"},
            {"comments",             "Access comments management",      "Modules"},
            {"contact_messages",     "Access contact messages",         "Modules"},
            {"newsletter",           "Access newsletter management",    "Modules"},
            {"reward_system",        "Access reward system",            "Modules"},
            {"ad_spaces",            "Access ad spaces management",     "Modules"},
            {"users",                "Access user management",          "Modules"},
            {"roles_permissions",    "Access roles & permissions",      "Modules"},
            {"seo_tools",            "Access SEO tools",                "Modules"},
            {"social_login",         "Access social login config",      "Modules"},
            {"languages",            "Access language management",      "Modules"},
            {"settings",             "Access system settings",          "Modules"},
            {"content_review",       "Access content review queue",     "Modules"},
            {"my_content",           "Access own content management",   "Modules"},
            {"ai_center",            "Access AI Center dashboard",      "Modules"},
            {"ai:manage",            "Manage AI templates and configurations", "AI Tools"},
        };

        Map<String, Permission> permMap = new HashMap<>();
        for (String[] p : allPermissions) {
            Permission perm = permissionRepository.findByName(p[0]).orElse(null);
            if (perm == null) {
                perm = new Permission(p[0], p[1], p[2]);
                perm = permissionRepository.save(perm);
            }
            permMap.put(p[0], perm);
        }
        System.out.println("Permissions seeded: " + permMap.size() + " total");

        // ── 2. Seed roles with default permission sets ───────────────────
        // Helper: resolve permission names to Permission entities
        java.util.function.Function<String[], Set<Permission>> resolve = names -> {
            Set<Permission> set = new HashSet<>();
            for (String n : names) {
                Permission pm = permMap.get(n);
                if (pm != null) set.add(pm);
            }
            return set;
        };

        // ── SUPER_ADMIN: all permissions ──
        seedRole(Role.SUPER_ADMIN, "Full system access",
            resolve.apply(permMap.keySet().toArray(new String[0])));

        // ── CHIEF_EDITOR ──
        seedRole(Role.CHIEF_EDITOR, "Full content management, user management for DA/MJ, content review, push notifications, polls, full analytics",
            resolve.apply(new String[]{
                // Content
                "article:create", "article:read", "article:update", "article:delete",
                "article:publish", "article:review", "article:unpublish",
                // User management (DA + MJ only, enforced in controller)
                "user:create", "user:read", "user:update", "user:suspend",
                // Moderation
                "content:review", "ugc:review", "profanity:manage", "profanity:view_reports",
                // Layout
                "home_layout:manage", "home_layout:delegated", "mobile_app_layout:manage",
                // Notifications
                "push_notification:send",
                // Polls
                "survey:manage",
                // Analytics (full)
                "analytics:view",
                // Taxonomy
                "taxonomy:manage",
                // AI
                "ai_rewriter:use",
                // Journalist management
                "journalist:create", "journalist:update", "journalist:suspend",
                // Config (read only)
                "config:read", "audit:view",
                // Module keys
                "admin_panel", "add_post", "manage_all_posts", "navigation", "pages",
                "rss_feeds", "categories", "widgets", "polls", "gallery", "comments",
                "contact_messages", "newsletter", "reward_system", "ad_spaces",
                "users", "content_review", "my_content", "languages", "ai_center"
            }));

        // ── DISTRICT_ADMIN ──
        seedRole(Role.DISTRICT_ADMIN, "District-scoped content and journalist management",
            resolve.apply(new String[]{
                // Content (district-scoped, enforced in controller)
                "article:create", "article:read", "article:update", "article:unpublish",
                "article:review",
                // Journalist management (own district only)
                "journalist:create", "journalist:update", "journalist:suspend",
                "user:create", "user:read", "user:update", "user:suspend",
                // Moderation (district-scoped)
                "content:review", "ugc:review",
                // Analytics (district only)
                "analytics:district_only",
                // AI
                "ai_rewriter:use",
                // Module keys
                "admin_panel", "add_post", "manage_all_posts",
                "content_review", "my_content", "users", "comments", "gallery", "ai_center"
            }));

        // ── MOBILE_JOURNALIST ──
        seedRole(Role.MOBILE_JOURNALIST, "Can create/submit news posts only",
            resolve.apply(new String[]{
                "article:create", "article:read", "article:update",
                "ai_rewriter:use",
                // Module keys
                "admin_panel", "add_post", "my_content"
            }));

        // ── INSTITUTION_LOGIN ──
        seedRole(Role.INSTITUTION_LOGIN, "Institutional news posting account",
            resolve.apply(new String[]{
                "article:create", "article:read", "article:update",
                "ai_rewriter:use",
                // Module keys
                "admin_panel", "add_post", "my_content"
            }));

        // ── READER ──
        seedRole(Role.READER, "Public front-end user, no admin access",
            new HashSet<>());

        System.out.println("Roles and permissions seeded successfully.");
    }

    private void seedRole(String name, String description, Set<Permission> permissions) {
        Role role = roleRepository.findByName(name).orElse(null);
        if (role == null) {
            role = new Role(name, description);
            role.setPermissions(permissions);
            roleRepository.save(role);
            System.out.println("  Created role: " + name + " with " + permissions.size() + " permissions");
        } else {
            // Update permissions if role already exists but permissions changed
            if (role.getPermissions().size() != permissions.size()) {
                role.setPermissions(permissions);
                role.setDescription(description);
                roleRepository.save(role);
                System.out.println("  Updated role: " + name + " to " + permissions.size() + " permissions");
            }
        }
    }

    private void seedAiPromptTemplates() {
        if (promptRepo.count() == 0) {
            promptRepo.save(new AiPromptTemplate(
                "rewriter",
                "Rewrite the following news text in a {rewrite_style} style:\n\n{article_content}",
                "gemini-2.0-flash", 0.7, 2000
            ));

            promptRepo.save(new AiPromptTemplate(
                "seo",
                "Based on the following article content, generate:\n1. SEO Title in Tamil (60-70 characters)\n2. Meta Description in Tamil (150-160 characters)\n3. URL Slug in transliterated English characters (lowercase, hyphens)\n4. Focus Keywords (comma separated)\n5. Tags (comma separated)\n\nFormat exactly as:\nSEO_TITLE: [title]\nMETA_DESC: [description]\nSLUG: [slug]\nKEYWORDS: [keywords]\nTAGS: [tags]\n\nContent:\n{article_content}",
                "gemini-2.0-flash", 0.7, 2000
            ));

            promptRepo.save(new AiPromptTemplate(
                "sensor",
                "Analyze the following article for duplicate content, plagiarism, low quality, or off-topic writing. Return in this format:\nFLAGGED: [true/false]\nREASON: [duplicate/plagiarism/low-quality/off-topic]\nCONFIDENCE: [score from 0.0 to 1.0]\nDESCRIPTION: [brief explanation]\n\nTitle: {article_title}\nContent: {article_content}",
                "gemini-2.0-flash", 0.7, 2000
            ));

            promptRepo.save(new AiPromptTemplate(
                "moderation",
                "Perform standard AI moderation and content flagging audit for profanity or inappropriate words.\n\nContent:\n{article_content}",
                "gemini-2.0-flash", 0.7, 2000
            ));

            promptRepo.save(new AiPromptTemplate(
                "suggestions",
                "Suggest 3 alternate headlines and 5 related tags for this content.\nFormat headlines as: ALT_HEADLINE 1: ...\nFormat tags as: SUGGESTED_TAGS: [comma separated]\n\nContent:\n{article_content}",
                "gemini-2.0-flash", 0.7, 2000
            ));
            System.out.println("Default AI Prompt templates seeded.");
        }
    }
}

