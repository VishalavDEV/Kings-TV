-- ==========================================
-- KINGS TV & NEWS PORTAL (KING 24x7)
-- MySQL Database Schema
-- Supports: Articles, Video Streaming, User Accounts, Subscriptions,
--           Local Directories, Classifeds, Wishes, Jobs, and Customizations.
-- ==========================================

CREATE DATABASE IF NOT EXISTS kings_tv_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE kings_tv_db;

-- -----------------------------------------------------
-- Table `users`
-- Purpose: System users, admins, journalists, and subscriber accounts.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique handle chosen by the user',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email address for login and notifications',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Securely hashed password string',
    `role` ENUM('user', 'vendor', 'reporter', 'editor', 'admin') DEFAULT 'user' COMMENT 'Access control role for dashboard management',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Flag to suspend or activate account access',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB COMMENT='User database containing subscriber accounts and staff management roles';

-- -----------------------------------------------------
-- Table `districts`
-- Purpose: List of Tamil Nadu districts supported in the district filter selector.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `districts` (
    `district_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name_ta` VARCHAR(50) NOT NULL UNIQUE COMMENT 'District name in Tamil (e.g., சென்னை)',
    `name_en` VARCHAR(50) NOT NULL UNIQUE COMMENT 'District name in English (e.g., Chennai)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Supported Tamil Nadu districts for region-based filtering';

-- -----------------------------------------------------
-- Table `news_categories`
-- Purpose: Classification of portal contents (politics, sports, business, tech, etc.).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(50) NOT NULL UNIQUE COMMENT 'URL slug representation (e.g., politics, cinema)',
    `name_ta` VARCHAR(100) NOT NULL COMMENT 'Display category title in Tamil (e.g., அரசியல்)',
    `name_en` VARCHAR(100) NOT NULL COMMENT 'Display category title in English (e.g., Politics)',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Allows hiding or showing entire categories from navigation',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Category classifications for site filtering and TV library division';

-- -----------------------------------------------------
-- Table `user_preferences`
-- Purpose: Custom UI dashboard state settings corresponding to the customization control panel.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_preferences` (
    `preference_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE COMMENT 'Links preference row directly to one user',
    `theme` ENUM('light', 'dark') DEFAULT 'light' COMMENT 'Theme configuration mode',
    `primary_color` VARCHAR(7) DEFAULT '#0057FF' COMMENT 'Primary Hex CSS theme color (whitelisted)',
    `font_size` ENUM('small', 'medium', 'large') DEFAULT 'medium' COMMENT 'Baseline browser font size setting',
    `widget_width` INT DEFAULT 640 COMMENT 'Width size configuration for right sidebar widgets',
    `slide_speed` INT DEFAULT 8 COMMENT 'Slide transition intervals for widgets in seconds',
    `language` VARCHAR(2) DEFAULT 'ta' COMMENT 'Selected locale language - ta (Tamil), en (English)',
    `default_district_id` INT NULL COMMENT 'Pre-selected district on topbar weather and localized news views',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`default_district_id`) REFERENCES `districts` (`district_id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Customization panel settings saved per user';

-- -----------------------------------------------------
-- Table `user_section_visibility`
-- Purpose: Tracks which portal sections are visible or hidden for the user (பகுதிகளை மறை/காட்டு).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_section_visibility` (
    `user_id` INT NOT NULL COMMENT 'Associated user profile',
    `section_id` VARCHAR(50) NOT NULL COMMENT 'Unique identifier of the section (e.g., hero, livetv, agri)',
    `is_visible` BOOLEAN DEFAULT TRUE COMMENT 'Indicates if the block is displayed on user main page',
    PRIMARY KEY (`user_id`, `section_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Per-user dashboard block visibility configuration';

-- -----------------------------------------------------
-- Table `articles`
-- Purpose: News articles containing title, description, content body, image, read time, and views.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
    `article_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Header headline of the article',
    `summary` TEXT NULL COMMENT 'Short description displayed on cards',
    `content` LONGTEXT NOT NULL COMMENT 'Detailed news story body text',
    `image_url` VARCHAR(255) NULL COMMENT 'Thumbnail or header banner asset path',
    `category_id` INT NOT NULL COMMENT 'Primary category link',
    `district_id` INT NULL COMMENT 'Nullable association for localized district news filtering',
    `author_id` INT NOT NULL COMMENT 'Reporter or editor who authored the news',
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Publication release date',
    `read_time_minutes` INT DEFAULT 3 COMMENT 'Estimated read duration in minutes',
    `views_count` INT DEFAULT 0 COMMENT 'Counter for analytics tracking and popularity algorithms',
    `status` ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT 'Current editorial lifecycle stage',
    `latitude` DOUBLE NULL COMMENT 'GPS latitude for geo-fenced visibility',
    `longitude` DOUBLE NULL COMMENT 'GPS longitude for geo-fenced visibility',
    `visibility_radius_km` DOUBLE NULL COMMENT 'Radius in km for visibility constraint',
    FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`category_id`) ON DELETE RESTRICT,
    FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE SET NULL,
    FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    INDEX `idx_articles_published` (`published_at`),
    INDEX `idx_articles_views` (`views_count`),
    INDEX `idx_articles_status` (`status`)
) ENGINE=InnoDB COMMENT='Written content articles and news releases';

-- -----------------------------------------------------
-- Table `video_contents`
-- Purpose: Support for TV Content Library, Live Streams, and video media items.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `video_contents` (
    `video_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Video title header',
    `description` TEXT NULL COMMENT 'Summary context detail for the broadcast',
    `video_url` VARCHAR(255) NOT NULL COMMENT 'Stream url source, YouTube iframe path, or live broadcast url',
    `thumbnail_url` VARCHAR(255) NULL COMMENT 'Preview image path',
    `duration_seconds` INT NOT NULL DEFAULT 0 COMMENT 'Run length of the video file',
    `category_id` INT NOT NULL COMMENT 'Reference class category',
    `is_live_tv` BOOLEAN DEFAULT FALSE COMMENT 'Specifies if this row represents the main Live TV feed',
    `views_count` INT DEFAULT 0 COMMENT 'Analytics tracking counter',
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`category_id`) ON DELETE RESTRICT,
    INDEX `idx_video_live` (`is_live_tv`),
    INDEX `idx_video_published` (`published_at`)
) ENGINE=InnoDB COMMENT='Content libraries, video clips, and Live TV streams';

-- -----------------------------------------------------
-- Table `web_stories`
-- Purpose: Fast-loading visual web stories displayed at the top of the portal.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_stories` (
    `story_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Cover title text',
    `category_id` INT NOT NULL COMMENT 'Associated news category',
    `badge` VARCHAR(20) DEFAULT 'NEW' COMMENT 'Cover badge tag status (NEW, HOT, TREND)',
    `background_gradient` VARCHAR(100) DEFAULT 'linear-gradient(135deg, #1E40AF, #3B82F6)' COMMENT 'Dynamic aesthetic colors',
    `views_count` INT DEFAULT 0,
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`category_id`) ON DELETE CASCADE,
    INDEX `idx_stories_views` (`views_count`)
) ENGINE=InnoDB COMMENT='Instagram-style cards for quick visual stories';

-- -----------------------------------------------------
-- Table `breaking_news`
-- Purpose: Ticker feed alerts scrolling across the top bar.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `breaking_news` (
    `breaking_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL COMMENT 'Alert text content in Tamil',
    `link_url` VARCHAR(255) NULL COMMENT 'Optionally redirects viewer to a main article',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL COMMENT 'Time constraint when ticker will automatically pull alert from display',
    INDEX `idx_breaking_expiry` (`expires_at`)
) ENGINE=InnoDB COMMENT='Short active flashing bulletins for breaking alerts';

-- -----------------------------------------------------
-- Table `comments`
-- Purpose: Feedback left on article detail views.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comments` (
    `comment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `article_id` INT NOT NULL COMMENT 'Reference link to the article being commented on',
    `user_id` INT NULL COMMENT 'Optional association to registered user profile',
    `commentor_name` VARCHAR(100) NOT NULL COMMENT 'Name specified by the author (anonymous support)',
    `commentor_email` VARCHAR(100) NOT NULL COMMENT 'Contact email validated on comment submission',
    `comment_text` TEXT NOT NULL COMMENT 'Paragraph content containing feedback text',
    `status` ENUM('pending', 'approved', 'spam') DEFAULT 'approved' COMMENT 'Mod status to control publication',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_comments_article` (`article_id`),
    INDEX `idx_comments_status` (`status`)
) ENGINE=InnoDB COMMENT='Comment threads written by portal visitors on articles';

-- -----------------------------------------------------
-- Table `newsletter_subscribers`
-- Purpose: Manage newsletters and email updates.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
    `subscriber_id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique subscriber email entry',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Subscription opt-in/opt-out status',
    `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_newsletter_active` (`is_active`)
) ENGINE=InnoDB COMMENT='Marketing lists for daily digests and news alerts';

-- -----------------------------------------------------
-- Table `local_business_directory`
-- Purpose: Yellow Pages style merchant directory listings (directory.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `local_business_directory` (
    `listing_id` INT AUTO_INCREMENT PRIMARY KEY,
    `business_name` VARCHAR(150) NOT NULL COMMENT 'Merchant commercial title',
    `category` ENUM('hospital', 'plumber', 'electrician', 'restaurant', 'store') NOT NULL COMMENT 'Industry category classification',
    `address_locality` VARCHAR(100) NOT NULL COMMENT 'Locality town or district selector',
    `address_street` VARCHAR(255) NOT NULL COMMENT 'Detailed address location lines',
    `working_hours` VARCHAR(100) NULL COMMENT 'Operational windows (e.g. காலை 9 - இரவு 9)',
    `phone_number` VARCHAR(20) NOT NULL COMMENT 'Official contact phone number',
    `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT 'Average feedback stars rating',
    `created_by` INT NULL COMMENT 'User who registered the directory listing',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_directory_cat_loc` (`category`, `address_locality`),
    FULLTEXT `idx_directory_search` (`business_name`, `address_street`)
) ENGINE=InnoDB COMMENT='Yellow Pages business directory metadata';

-- -----------------------------------------------------
-- Table `classified_advertisements`
-- Purpose: Classified items and regional merchant discount offers (classifieds.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `classified_advertisements` (
    `ad_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL COMMENT 'Title header (e.g., Splendor பைக் விற்பனைக்கு)',
    `category` ENUM('property', 'vehicle', 'appliance', 'discount') NOT NULL COMMENT 'Ad segment type',
    `price_detail` VARCHAR(100) NOT NULL COMMENT 'Price value or promo tag details (e.g., ₹35,000 or 30% தள்ளுபடி)',
    `location` VARCHAR(100) NOT NULL COMMENT 'Sales location town/district name',
    `contact_info` VARCHAR(100) NOT NULL COMMENT 'Seller name and phone details (e.g., ராஜா - 9876543210)',
    `description` TEXT NOT NULL COMMENT 'Product condition details or discount guidelines',
    `created_by` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_classified_cat` (`category`),
    INDEX `idx_classified_location` (`location`)
) ENGINE=InnoDB COMMENT='Buy/sell Classified listings and store discounts';

-- -----------------------------------------------------
-- Table `local_wishes`
-- Purpose: Celebrations, congratulatory notes, and greetings (wishes.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `local_wishes` (
    `wish_id` INT AUTO_INCREMENT PRIMARY KEY,
    `recipient_name` VARCHAR(100) NOT NULL COMMENT 'Name of person being congratulated',
    `category` ENUM('birthday', 'wedding', 'achievement') NOT NULL COMMENT 'Type of event greeting card',
    `message` TEXT NOT NULL COMMENT 'Aesthetic greeting text body',
    `sender_name` VARCHAR(100) NOT NULL COMMENT 'Name of person offering greetings (e.g. நண்பர்கள் குழு)',
    `created_by` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_wishes_cat` (`category`)
) ENGINE=InnoDB COMMENT='Greetings board wishes published by community members';

-- -----------------------------------------------------
-- Table `local_obituaries`
-- Purpose: Death notices and funeral arrangement directories (obituaries.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `local_obituaries` (
    `obit_id` INT AUTO_INCREMENT PRIMARY KEY,
    `deceased_name` VARCHAR(100) NOT NULL COMMENT 'Name of the deceased',
    `age` INT NOT NULL COMMENT 'Deceased age parameter',
    `location` VARCHAR(100) NOT NULL COMMENT 'Home locality city/town name',
    `demise_date` DATE NOT NULL COMMENT 'Date of passing',
    `funeral_details` VARCHAR(255) NOT NULL COMMENT 'Date, timing and instructions for final rites',
    `short_description` TEXT NOT NULL COMMENT 'Family metadata, achievements or general details',
    `created_by` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_obituaries_locality` (`location`),
    INDEX `idx_obituaries_date` (`demise_date`)
) ENGINE=InnoDB COMMENT='Obituary announcements for final tributes and condolences';

-- -----------------------------------------------------
-- Table `jobs_board`
-- Purpose: Business staffing hires and vacant postings (jobs.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs_board` (
    `job_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL COMMENT 'Role designation title',
    `company_name` VARCHAR(150) NOT NULL COMMENT 'Recruiter company name',
    `category` ENUM('sales', 'driver', 'office', 'computer', 'other') NOT NULL COMMENT 'Job function category',
    `location` VARCHAR(100) NOT NULL COMMENT 'Place of employment city/town',
    `salary_range` VARCHAR(100) NOT NULL COMMENT 'Compensation bounds details (e.g., ₹15,000 - ₹18,000)',
    `employment_type` ENUM('Full Time', 'Part Time') DEFAULT 'Full Time' COMMENT 'Work duration shift type',
    `description` TEXT NOT NULL COMMENT 'Key duties and candidate profile requirements',
    `created_by` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_jobs_cat_loc` (`category`, `location`)
) ENGINE=InnoDB COMMENT='Job vacancy notices for local recruitment';

-- -----------------------------------------------------
-- Table `job_applications`
-- Purpose: Candidate submissions for open vacancies (jobs.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_applications` (
    `application_id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL COMMENT 'Target vacancy profile being applied to',
    `applicant_name` VARCHAR(100) NOT NULL COMMENT 'Full name of candidate',
    `applicant_phone` VARCHAR(20) NOT NULL COMMENT 'Contact voice line phone number',
    `experience` ENUM('fresher', '1yr', '2-3yr', '4+yr') NOT NULL COMMENT 'Work experience bracket choice',
    `summary` TEXT NULL COMMENT 'Personal details or qualifications snippet',
    `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`job_id`) REFERENCES `jobs_board` (`job_id`) ON DELETE CASCADE,
    INDEX `idx_applications_job` (`job_id`)
) ENGINE=InnoDB COMMENT='Applications received for published job vacancies';

-- -----------------------------------------------------
-- Table `success_stories`
-- Purpose: Local entrepreneur insights and case studies (business-studies.html).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `success_stories` (
    `story_id` INT AUTO_INCREMENT PRIMARY KEY,
    `author_name` VARCHAR(100) NOT NULL COMMENT 'Name of user publishing the post',
    `business_name` VARCHAR(150) NOT NULL COMMENT 'Name of the business profiled',
    `title` VARCHAR(255) NOT NULL COMMENT 'Story title (e.g., தேநீர் கடையின் டிஜிட்டல் வளர்ச்சி)',
    `details` TEXT NOT NULL COMMENT 'Detailed textual story, strategies, and growth details',
    `is_case_study` BOOLEAN DEFAULT FALSE COMMENT 'Specifies corporate case studies vs user submissions',
    `pdf_url` VARCHAR(255) NULL COMMENT 'Optionally references a case study downloadable PDF asset',
    `created_by` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_success_casestudy` (`is_case_study`)
) ENGINE=InnoDB COMMENT='Case study guides and local merchant success stories';

-- -----------------------------------------------------
-- Table `user_viewing_history`
-- Purpose: Video library view states, bookmarks and telemetry progress tracking.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_viewing_history` (
    `history_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Viewer identity user link',
    `video_id` INT NULL COMMENT 'References video library watch items',
    `article_id` INT NULL COMMENT 'References text article library views',
    `watched_duration_seconds` INT DEFAULT 0 COMMENT 'Progress tracking offset point for videos',
    `is_completed` BOOLEAN DEFAULT FALSE COMMENT 'Specifies if video is completely viewed',
    `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`video_id`) REFERENCES `video_contents` (`video_id`) ON DELETE CASCADE,
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE,
    INDEX `idx_history_user` (`user_id`),
    INDEX `idx_history_viewed` (`viewed_at`)
) ENGINE=InnoDB COMMENT='Viewing history and library metrics for recommendations';

-- -----------------------------------------------------
-- Table `user_watchlist`
-- Purpose: User custom playlist bookmarks for videos and reading lists.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_watchlist` (
    `watchlist_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Associated user profile key',
    `video_id` INT NULL COMMENT 'Target bookmark video link',
    `article_id` INT NULL COMMENT 'Target bookmark news article link',
    `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`video_id`) REFERENCES `video_contents` (`video_id`) ON DELETE CASCADE,
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_watch_item` (`user_id`, `video_id`, `article_id`),
    INDEX `idx_watchlist_user` (`user_id`)
) ENGINE=InnoDB COMMENT='Watchlists and reading lists saved by subscribers';

-- -----------------------------------------------------
-- Table `subscription_plans`
-- Purpose: Core subscription products for media access (ad-free, e-papers, premium video).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscription_plans` (
    `plan_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Product level (e.g. Free, Premium Monthly, VIP Annual)',
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Billing price value',
    `duration_days` INT NOT NULL COMMENT 'Validity active span of the plan',
    `description` TEXT NULL COMMENT 'Included plan benefits details list',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Access plans offered by the TV platform';

-- -----------------------------------------------------
-- Table `user_subscriptions`
-- Purpose: User payment status, plans and billing status details.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
    `subscription_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `plan_id` INT NOT NULL,
    `start_date` DATE NOT NULL COMMENT 'Coverage active beginning point',
    `end_date` DATE NOT NULL COMMENT 'Termination point when coverage expires',
    `status` ENUM('active', 'expired', 'cancelled') DEFAULT 'active' COMMENT 'Billing state metadata',
    `payment_status` VARCHAR(50) DEFAULT 'paid' COMMENT 'Gateway tracking status (paid, pending, refunded)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`plan_id`) ON DELETE RESTRICT,
    INDEX `idx_subscription_user` (`user_id`),
    INDEX `idx_subscription_expiry` (`end_date`, `status`)
) ENGINE=InnoDB COMMENT='Subscriber memberships and status';

-- -----------------------------------------------------
-- Table `recommendations`
-- Purpose: Tailored media suggestions populated by interest scoring rules.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `recommendations` (
    `recommendation_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL COMMENT 'Target user profile',
    `video_id` INT NULL COMMENT 'Suggested video item link',
    `article_id` INT NULL COMMENT 'Suggested news article link',
    `score` DECIMAL(5,4) NOT NULL COMMENT 'Affinity weight calculation score (e.g., 0.9500)',
    `reason` VARCHAR(255) NULL COMMENT 'Reason text (e.g., Based on interest in Erode district)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`video_id`) REFERENCES `video_contents` (`video_id`) ON DELETE CASCADE,
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_rec_item` (`user_id`, `video_id`, `article_id`),
    INDEX `idx_rec_user_score` (`user_id`, `score` DESC)
) ENGINE=InnoDB COMMENT='Algorithmic recommended feeds computed per subscriber';


CREATE TABLE IF NOT EXISTS obituary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deceased_name VARCHAR(200) NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    age TINYINT UNSIGNED NULL,
    gender ENUM('MALE','FEMALE','OTHER') NULL,
    date_of_birth DATE NULL,
    date_of_passing DATE NOT NULL,
    state_id INT NOT NULL,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    village_id INT NULL,
    pincode VARCHAR(10) NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    religion_id INT NULL,
    community_id INT NULL,
    funeral_datetime DATETIME NOT NULL,
    funeral_venue_address TEXT NOT NULL,
    funeral_map_url VARCHAR(500) NULL,
    family_contact_name VARCHAR(150) NOT NULL,
    family_contact_phone VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    poster_relationship ENUM('SELF','SPOUSE','SON','DAUGHTER','FATHER','MOTHER','BROTHER','SISTER','GRANDCHILD','RELATIVE','FRIEND','NEIGHBOUR','OTHER') NOT NULL,
    biography_tribute TEXT NOT NULL,
    frame_template_id INT NOT NULL,
    tribute_count INT NOT NULL DEFAULT 0,
    report_count INT NOT NULL DEFAULT 0,
    status ENUM('PENDING','PUBLISHED','ARCHIVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    INDEX idx_location(state_id,district_id,taluk_id,village_id),
    INDEX idx_status(status),
    INDEX idx_passing(date_of_passing),
    INDEX idx_funeral(funeral_datetime),
);

CREATE TABLE IF NOT EXISTS obituary_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obituary_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    CONSTRAINT fk_obituary_gallery
        FOREIGN KEY (obituary_id)
        REFERENCES obituary(obituary_id)
        ON DELETE CASCADE,
    UNIQUE KEY uk_obituary_photo(obituary_id,display_order)
);

CREATE TABLE IF NOT EXISTS obituary_tribute (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    obituary_id INT NOT NULL,
    user_id BIGINT NULL,
    device_id VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    CONSTRAINT fk_tribute_obituary
        FOREIGN KEY (obituary_id)
        REFERENCES obituary(obituary_id)
        ON DELETE CASCADE,
    UNIQUE KEY uk_user(obituary_id,user_id),
    UNIQUE KEY uk_device(obituary_id,device_id)
);

CREATE TABLE obituary_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    obituary_id INT NOT NULL,
    reported_by BIGINT NULL,
    reason ENUM(
        'SPAM',
        'FAKE',
        'WRONG_INFORMATION',
        'OFFENSIVE',
        'COPYRIGHT',
        'OTHER'
    ) NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    CONSTRAINT fk_report_obituary
        FOREIGN KEY (obituary_id)
        REFERENCES obituary(obituary_id)
        ON DELETE CASCADE
);

CREATE TABLE obituary_guestbook (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    obituary_id INT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED'
    ) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_guestbook_obituary
        FOREIGN KEY (obituary_id)
        REFERENCES obituary(obituary_id)
        ON DELETE CASCADE,
    is_deleted INT default 0,
    INDEX idx_obituary(obituary_id),
    INDEX idx_status(status)
);

CREATE TABLE obituary_frame_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    preview_image VARCHAR(500),
    frame_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted INT default 0,
);


CREATE TABLE job (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_user_id BIGINT NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    company_logo VARCHAR(500),
    job_title VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    sub_category_id INT,
    job_type ENUM(
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERNSHIP',
        'WORK_FROM_HOME'
    ) NOT NULL,
    experience_required ENUM(
        'FRESHER',
        '1_3_YEARS',
        '3_5_YEARS',
        '5_PLUS_YEARS'
    ) NOT NULL,
    education_required ENUM(
        'ANY',
        '10TH',
        '12TH',
        'DIPLOMA',
        'GRADUATE',
        'POST_GRADUATE'
    ) NOT NULL,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_type ENUM(
        'MONTHLY',
        'ANNUAL'
    ) NOT NULL,
    is_salary_negotiable BOOLEAN DEFAULT FALSE,
    openings INT NOT NULL DEFAULT 1,
    state_id INT NOT NULL,
    district_id INT NOT NULL,
    taluk_id INT,
    village_id INT,
    pincode VARCHAR(10),
    is_remote BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    responsibilities TEXT,
    application_deadline DATE,
    apply_mode ENUM(
        'PORTAL',
        'CALL_HR',
        'WHATSAPP'
    ) NOT NULL,
    hr_contact_phone VARCHAR(20),
    hr_email VARCHAR(150),
    is_verified_employer BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM(
        'ACTIVE',
        'CLOSED',
        'EXPIRED',
        'REJECTED'
    ) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    INDEX idx_location(state_id,district_id,taluk_id),
    INDEX idx_category(category_id),
    INDEX idx_status(status),
    INDEX idx_deadline(application_deadline)
);


CREATE TABLE job_skill (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    is_deleted INT default 0,
    FOREIGN KEY(job_id)
        REFERENCES job(job_id)
        ON DELETE CASCADE,
    INDEX idx_skill(skill_name)
);

CREATE TABLE job_seeker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    photo_url VARCHAR(500),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    phone_verified BOOLEAN DEFAULT FALSE,
    dob DATE,
    age INT,
    gender ENUM(
        'MALE',
        'FEMALE',
        'OTHER'
    ),
    state_id INT,
    district_id INT,
    taluk_id INT,
    village_id INT,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    highest_qualification ENUM(
        'ANY',
        '10TH',
        '12TH',
        'DIPLOMA',
        'GRADUATE',
        'POST_GRADUATE'
    ),
    experience_years DECIMAL(4,1),
    expected_salary DECIMAL(12,2),
    preferred_job_type ENUM(
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERNSHIP',
        'WORK_FROM_HOME'
    ),
    availability ENUM(
        'IMMEDIATE',
        '15_DAYS',
        '1_MONTH',
        'NOTICE_PERIOD'
    ),
    resume_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    is_deleted INT default 0,
);

CREATE TABLE job_seeker_skill (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seeker_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY(seeker_id)
        REFERENCES job_seeker(seeker_id)
        ON DELETE CASCADE,
    INDEX idx_skill(skill_name)
);

CREATE TABLE job_application (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    seeker_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'APPLIED',
        'VIEWED',
        'SHORTLISTED',
        'REJECTED',
        'HIRED'
    ) DEFAULT 'APPLIED',
    cover_note TEXT,
    resume_snapshot VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id)
        REFERENCES job(job_id)
        ON DELETE CASCADE,
    FOREIGN KEY(seeker_id)
        REFERENCES job_seeker(seeker_id)
        ON DELETE CASCADE,
    UNIQUE KEY uk_job_application(job_id,seeker_id),
    INDEX idx_status(status),
    INDEX idx_job(job_id),
    INDEX idx_seeker(seeker_id)
);
