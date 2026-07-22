-- ==========================================
-- KINGS TV & NEWS PORTAL (KING 24x7)
-- MySQL Database Schema (Java Spring Boot Version)
-- ==========================================

-- CREATE DATABASE IF NOT EXISTS kings_tv_db;
-- USE kings_tv_db;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(50) DEFAULT 'LOCAL',
    `profile_image` VARCHAR(255) NULL,
    `role` VARCHAR(50) DEFAULT 'READER',
    `phone_number` VARCHAR(20) NULL,
    `website_url` VARCHAR(255) NULL,
    `firebase_uid` VARCHAR(128) NULL,
    `location` VARCHAR(200) NULL,
    `interests` TEXT NULL,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
    `role_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissions` (
    `permission_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `role_permissions` (Join Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `category_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `name_ta` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `display_order` INT DEFAULT 0,
    `icon` VARCHAR(100) NULL,
    `is_nav` BOOLEAN DEFAULT TRUE,
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `districts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `districts` (
    `district_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name_ta` VARCHAR(50) NOT NULL UNIQUE,
    `name_en` VARCHAR(50) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `articles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
    `article_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT NOT NULL,
    `district_id` BIGINT NULL,
    `title_ta` VARCHAR(255) NOT NULL,
    `title_en` VARCHAR(255) NULL,
    `content_ta` LONGTEXT NOT NULL,
    `content_en` LONGTEXT NULL,
    `short_desc_ta` TEXT NULL,
    `short_desc_en` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `views_count` INT DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'published',
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` VARCHAR(255) NULL,
    `focus_keywords` VARCHAR(255) NULL,
    `slug` VARCHAR(255) UNIQUE NULL,
    `canonical_url` VARCHAR(255) NULL,
    `featured_image` VARCHAR(255) NULL,
    `author_name` VARCHAR(100) DEFAULT 'Kings TV News Desk',
    `seo_status` VARCHAR(50) DEFAULT 'ready',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `visibility_radius_km` DOUBLE NULL,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT,
    FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `video_contents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `video_contents` (
    `video_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `youtube_url` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `is_live_tv` INT DEFAULT 0,
    `views_count` INT DEFAULT 0,
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `thumbnail_url` VARCHAR(255) NULL,
    `duration_seconds` INT DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'published',
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `web_stories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `web_stories` (
    `story_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `cta_url` VARCHAR(500) NULL,
    `badge` VARCHAR(20) DEFAULT 'NEW',
    `background_gradient` VARCHAR(100) NULL,
    `display_order` INT DEFAULT 0,
    `views_count` INT DEFAULT 0,
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comments` (
    `comment_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `article_id` BIGINT NOT NULL,
    `commentor_name` VARCHAR(100) NOT NULL,
    `commentor_email` VARCHAR(100) NULL,
    `comment_text` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `companies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `companies` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `uuid` VARCHAR(100) NOT NULL UNIQUE,
    `company_name` VARCHAR(200) NOT NULL,
    `logo` VARCHAR(255) NULL,
    `cover_image` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `linkedin` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `industry` VARCHAR(255) NULL,
    `employee_count` INT NULL,
    `founded_year` INT NULL,
    `about` TEXT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `user_id` BIGINT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `rfqs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rfqs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `buyer_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `sub_category` VARCHAR(100) NULL,
    `description` TEXT NOT NULL,
    `quantity` INT NOT NULL,
    `budget` VARCHAR(100) NULL,
    `location` VARCHAR(100) NOT NULL,
    `attachment_url` VARCHAR(255) NULL,
    `deadline` TIMESTAMP NOT NULL,
    `status` VARCHAR(50) DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `rfq_quotes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rfq_quotes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `rfq_id` BIGINT NOT NULL,
    `seller_business_id` BIGINT NOT NULL,
    `quoted_price` DOUBLE NOT NULL,
    `timeline_days` INT NOT NULL,
    `notes` TEXT NULL,
    `proposal_url` VARCHAR(255) NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary_frame_template`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary_frame_template` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `template_name` VARCHAR(100) NOT NULL,
    `preview_image` VARCHAR(500) NULL,
    `frame_image` VARCHAR(500) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `deceased_name` VARCHAR(200) NOT NULL,
    `photo_url` VARCHAR(500) NOT NULL,
    `age` TINYINT UNSIGNED NULL,
    `gender` ENUM('MALE','FEMALE','OTHER') NULL,
    `date_of_birth` DATE NULL,
    `date_of_passing` DATE NOT NULL,
    `state_id` INT NOT NULL,
    `district_id` INT NOT NULL,
    `taluk_id` INT NULL,
    `village_id` INT NULL,
    `pincode` VARCHAR(10) NULL,
    `latitude` DECIMAL(10,8) NULL,
    `longitude` DECIMAL(11,8) NULL,
    `religion_id` INT NULL,
    `community_id` INT NULL,
    `funeral_datetime` DATETIME NOT NULL,
    `funeral_venue_address` TEXT NOT NULL,
    `funeral_map_url` VARCHAR(500) NULL,
    `family_contact_name` VARCHAR(150) NOT NULL,
    `family_contact_phone` VARCHAR(20) NOT NULL,
    `phone_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `poster_relationship` ENUM('SELF','SPOUSE','SON','DAUGHTER','FATHER','MOTHER','BROTHER','SISTER','GRANDCHILD','RELATIVE','FRIEND','NEIGHBOUR','OTHER') NOT NULL,
    `biography_tribute` TEXT NOT NULL,
    `frame_template_id` INT NOT NULL,
    `tribute_count` INT NOT NULL DEFAULT 0,
    `report_count` INT NOT NULL DEFAULT 0,
    `status` ENUM('PENDING','PUBLISHED','ARCHIVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_by` BIGINT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    INDEX `idx_location` (`state_id`,`district_id`,`taluk_id`,`village_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_passing` (`date_of_passing`),
    INDEX `idx_funeral` (`funeral_datetime`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary_gallery`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary_gallery` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `obituary_id` INT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `display_order` TINYINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    CONSTRAINT `fk_obituary_gallery`
        FOREIGN KEY (`obituary_id`)
        REFERENCES `obituary` (`id`)
        ON DELETE CASCADE,
    UNIQUE KEY `uk_obituary_photo` (`obituary_id`,`display_order`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary_tribute`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary_tribute` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `obituary_id` INT NOT NULL,
    `user_id` BIGINT NULL,
    `device_id` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    CONSTRAINT `fk_tribute_obituary`
        FOREIGN KEY (`obituary_id`)
        REFERENCES `obituary` (`id`)
        ON DELETE CASCADE,
    UNIQUE KEY `uk_user` (`obituary_id`,`user_id`),
    UNIQUE KEY `uk_device` (`obituary_id`,`device_id`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary_report`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary_report` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `obituary_id` INT NOT NULL,
    `reported_by` BIGINT NULL,
    `reason` ENUM('SPAM','FAKE','WRONG_INFORMATION','OFFENSIVE','COPYRIGHT','OTHER') NOT NULL,
    `remarks` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    CONSTRAINT `fk_report_obituary`
        FOREIGN KEY (`obituary_id`)
        REFERENCES `obituary` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `obituary_guestbook`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `obituary_guestbook` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `obituary_id` INT NOT NULL,
    `guest_name` VARCHAR(150) NOT NULL,
    `guest_phone` VARCHAR(20) NULL,
    `message` TEXT NOT NULL,
    `is_approved` BOOLEAN DEFAULT FALSE,
    `status` ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    CONSTRAINT `fk_guestbook_obituary`
        FOREIGN KEY (`obituary_id`)
        REFERENCES `obituary` (`id`)
        ON DELETE CASCADE,
    INDEX `idx_obituary` (`obituary_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `job`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employer_user_id` BIGINT NOT NULL,
    `company_name` VARCHAR(200) NOT NULL,
    `company_logo` VARCHAR(500) NULL,
    `job_title` VARCHAR(200) NOT NULL,
    `category_id` INT NOT NULL,
    `sub_category_id` INT NULL,
    `job_type` ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','WORK_FROM_HOME') NOT NULL,
    `experience_required` ENUM('FRESHER','1_3_YEARS','3_5_YEARS','5_PLUS_YEARS') NOT NULL,
    `education_required` ENUM('ANY','10TH','12TH','DIPLOMA','GRADUATE','POST_GRADUATE') NOT NULL,
    `salary_min` DECIMAL(12,2) NULL,
    `salary_max` DECIMAL(12,2) NULL,
    `salary_type` ENUM('MONTHLY','ANNUAL') NOT NULL,
    `is_salary_negotiable` BOOLEAN DEFAULT FALSE,
    `openings` INT NOT NULL DEFAULT 1,
    `state_id` INT NOT NULL,
    `district_id` INT NOT NULL,
    `taluk_id` INT NULL,
    `village_id` INT NULL,
    `pincode` VARCHAR(10) NULL,
    `is_remote` BOOLEAN DEFAULT FALSE,
    `description` TEXT NOT NULL,
    `responsibilities` TEXT NULL,
    `application_deadline` DATE NULL,
    `apply_mode` ENUM('PORTAL','CALL_HR','WHATSAPP') NOT NULL,
    `hr_contact_phone` VARCHAR(20) NULL,
    `hr_email` VARCHAR(150) NULL,
    `is_verified_employer` BOOLEAN DEFAULT FALSE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `status` ENUM('ACTIVE','CLOSED','EXPIRED','REJECTED') DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    INDEX `idx_location` (`state_id`,`district_id`,`taluk_id`),
    INDEX `idx_category` (`category_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_deadline` (`application_deadline`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `job_skill`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_skill` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `skill_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0,
    FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
    INDEX `idx_skill` (`skill_name`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `job_seeker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_seeker` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNIQUE NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `photo_url` VARCHAR(500) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NULL,
    `phone_verified` BOOLEAN DEFAULT FALSE,
    `dob` DATE NULL,
    `age` INT NULL,
    `gender` ENUM('MALE','FEMALE','OTHER') NULL,
    `state_id` INT NULL,
    `district_id` INT NULL,
    `taluk_id` INT NULL,
    `village_id` INT NULL,
    `willing_to_relocate` BOOLEAN DEFAULT FALSE,
    `highest_qualification` ENUM('ANY','10TH','12TH','DIPLOMA','GRADUATE','POST_GRADUATE') NULL,
    `experience_years` DECIMAL(4,1) NULL,
    `expected_salary` DECIMAL(12,2) NULL,
    `preferred_job_type` ENUM('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','WORK_FROM_HOME') NULL,
    `availability` ENUM('IMMEDIATE','15_DAYS','1_MONTH','NOTICE_PERIOD') NULL,
    `resume_file` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` INT DEFAULT 0
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `job_seeker_skill`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_seeker_skill` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `seeker_id` INT NOT NULL,
    `skill_name` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`seeker_id`) REFERENCES `job_seeker` (`id`) ON DELETE CASCADE,
    INDEX `idx_skill` (`skill_name`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `job_application`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_application` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `seeker_id` INT NOT NULL,
    `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('APPLIED','VIEWED','SHORTLISTED','REJECTED','HIRED') DEFAULT 'APPLIED',
    `cover_note` TEXT NULL,
    `resume_snapshot` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`seeker_id`) REFERENCES `job_seeker` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_job_application` (`job_id`,`seeker_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_job` (`job_id`),
    INDEX `idx_seeker` (`seeker_id`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `navigation_menus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `navigation_menus` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title_ta` VARCHAR(255) NOT NULL,
    `title_en` VARCHAR(255) NOT NULL,
    `link_url` VARCHAR(255) NOT NULL,
    `display_order` INT DEFAULT 0,
    `parent_id` BIGINT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Performance Tuning Indexes
-- -----------------------------------------------------
CREATE INDEX `idx_articles_status_published` ON `articles` (`status`, `published_at` DESC);
CREATE INDEX `idx_articles_category_status` ON `articles` (`category_id`, `status`);
CREATE INDEX `idx_articles_district_status` ON `articles` (`district_id`, `status`);
CREATE INDEX `idx_articles_views` ON `articles` (`views_count` DESC);

-- -----------------------------------------------------
-- Table `advertisers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(255) NOT NULL,
    `contact_email` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(100) NULL,
    `status` VARCHAR(50) DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `campaigns`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `campaigns` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `advertiser_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `start_date` TIMESTAMP NULL,
    `end_date` TIMESTAMP NULL,
    `budget` DOUBLE DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'draft',
    `target_pages_categories` TEXT NULL,
    FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `ad_slots`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ad_slots` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `placement` VARCHAR(100) NOT NULL UNIQUE,
    `dimensions` VARCHAR(50) NOT NULL,
    `max_concurrent_ads` INT DEFAULT 1
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `ads`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ads` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `campaign_id` BIGINT NOT NULL,
    `ad_slot_id` BIGINT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `image_url` VARCHAR(1024) NULL,
    `html_code` TEXT NULL,
    `click_url` VARCHAR(1024) NULL,
    `status` VARCHAR(50) DEFAULT 'active',
    `impressions` INT DEFAULT 0,
    `clicks` INT DEFAULT 0,
    `start_date` TIMESTAMP NULL,
    `end_date` TIMESTAMP NULL,
    `display_frequency` VARCHAR(100) NULL,
    `delay_seconds` INT DEFAULT 0,
    `close_button_required` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`ad_slot_id`) REFERENCES `ad_slots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `ad_events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ad_events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ad_id` BIGINT NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `audit_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `audit_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `actor_id` BIGINT NULL,
    `actor_email` VARCHAR(100) NULL,
    `actor_role` VARCHAR(50) NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT NULL,
    `before_value` TEXT NULL,
    `after_value` TEXT NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `login_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_user_id` BIGINT NULL,
    `email_attempted` VARCHAR(255) NOT NULL,
    `success` BOOLEAN NOT NULL,
    `failure_reason` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(512) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `user_activity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_activity` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `admin_user_id` BIGINT NOT NULL,
    `activity_type` VARCHAR(50) NOT NULL,
    `page_or_endpoint` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `security_events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `security_events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `event_type` VARCHAR(100) NOT NULL,
    `severity` VARCHAR(20) NOT NULL,
    `details` TEXT NULL,
    `admin_user_id` BIGINT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `api_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `endpoint` VARCHAR(255) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `status_code` INT NOT NULL,
    `response_time_ms` BIGINT NOT NULL,
    `caller_type` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_apilog_status` (`status_code`),
    INDEX `idx_apilog_method` (`method`),
    INDEX `idx_apilog_created` (`created_at`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `custom_pages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `custom_pages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `keywords` VARCHAR(255) NULL,
    `language` VARCHAR(10) DEFAULT 'ta',
    `parent_link_id` BIGINT NULL,
    `menu_order` INT DEFAULT 0,
    `location` VARCHAR(50) DEFAULT 'NONE',
    `content` LONGTEXT NULL,
    `visibility` VARCHAR(50) DEFAULT 'Public',
    `page_type` VARCHAR(50) DEFAULT 'standard',
    `team_members` TEXT NULL,
    `milestones` TEXT NULL,
    `phone_numbers` TEXT NULL,
    `email_addresses` TEXT NULL,
    `office_hours` TEXT NULL,
    `embedded_map` TEXT NULL,
    `version` INT DEFAULT 1,
    `effective_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Conditional Unique Index for special page types (non-standard)
-- -----------------------------------------------------
CREATE UNIQUE INDEX uk_special_page_type ON custom_pages (
    (CASE WHEN page_type <> 'standard' THEN page_type ELSE NULL END)
);

-- -----------------------------------------------------
-- Table `page_version_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `page_version_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `page_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NULL,
    `version` INT NOT NULL,
    `effective_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`page_id`) REFERENCES `custom_pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `general_applications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `general_applications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `cover_letter` TEXT NULL,
    `resume_url` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Seeding Initial Rows for Special Pages
-- -----------------------------------------------------
INSERT INTO `custom_pages` (`title`, `slug`, `page_type`, `content`, `visibility`)
SELECT 'எங்களைப் பற்றி / About Us', 'about-us', 'about_us', 'எங்களைப் பற்றி...', 'Public'
FROM (SELECT 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `custom_pages` WHERE `page_type` = 'about_us');

INSERT INTO `custom_pages` (`title`, `slug`, `page_type`, `content`, `visibility`)
SELECT 'தொடர்பு கொள்ள / Contact Us', 'contact-us', 'contact', 'தொடர்பு கொள்ள...', 'Public'
FROM (SELECT 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `custom_pages` WHERE `page_type` = 'contact');

INSERT INTO `custom_pages` (`title`, `slug`, `page_type`, `content`, `visibility`)
SELECT 'வேலைவாய்ப்பு / Careers', 'careers', 'career', 'வேலைவாய்ப்பு தகவல்கள்...', 'Public'
FROM (SELECT 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `custom_pages` WHERE `page_type` = 'career');

INSERT INTO `custom_pages` (`title`, `slug`, `page_type`, `content`, `visibility`)
SELECT 'தனியுரிமைக் கொள்கை / Privacy Policy', 'privacy-policy', 'privacy_policy', 'தனியுரிமை கொள்கைகள்...', 'Public'
FROM (SELECT 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `custom_pages` WHERE `page_type` = 'privacy_policy');

INSERT INTO `custom_pages` (`title`, `slug`, `page_type`, `content`, `visibility`)
SELECT 'பயன்பாட்டு விதிகள் / Terms of Use', 'terms-of-use', 'terms_of_use', 'பயன்பாட்டு விதிமுறைகள்...', 'Public'
FROM (SELECT 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `custom_pages` WHERE `page_type` = 'terms_of_use');

