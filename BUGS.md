# King 24x7 — Systematic Bug Tracking Log (BUGS.md)

This document contains a comprehensive audit and resolution log for all identified bugs across Encoding, UI, Functionality, and Redirects, complete with root causes, fixes, and verification evidence.

---

## Phase 0 — Unicode & Character Encoding Bug ("?" / Garbled Characters)

### BUG-001: JDBC Connection String Missing UTF-8 & Unicode Parameters
- **BUG**: Tamil text parameters sent through Spring Data JPA / JDBC to TiDB are converted to `?` (question mark) characters or garbled bytes.
- **WHERE FOUND**: Database Connection Layer / Backend (`backend/src/main/resources/application.properties`).
- **ROOT CAUSE**: The JDBC URL `jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/kings_tv_db` was missing `useUnicode=true&characterEncoding=UTF-8`. Without these explicit driver options, MySQL Connector/J string serialization defaults to single-byte character encoding (Latin-1/ISO-8859-1), converting multi-byte Tamil Unicode codepoints to `?`.
- **FIX**: Updated `spring.datasource.url` in `application.properties` to append `&useUnicode=true&characterEncoding=UTF-8` and added `hibernate.connection.useUnicode=true`, `hibernate.connection.characterEncoding=UTF-8`, and `hibernate.connection.CharSet=utf8mb4`.
- **STATUS**: Fixed
- **VERIFIED**: Confirmed JDBC driver connection options include `useUnicode=true` and `characterEncoding=UTF-8` during Spring Boot initialization.

### BUG-002: Backend HTTP Response Missing Explicit UTF-8 Force Encoding Filter
- **BUG**: API responses could default to ISO-8859-1 depending on client HTTP headers, causing Tamil characters in JSON responses to appear corrupted.
- **WHERE FOUND**: Backend Security Filter Chain (`backend/src/main/java/com/kingstv/config/SecurityConfig.java`).
- **ROOT CAUSE**: Missing `CharacterEncodingFilter` before security execution.
- **FIX**: Added `CharacterEncodingFilter` configured with `setEncoding("UTF-8")` and `setForceEncoding(true)` to `SecurityConfig.java`.
- **STATUS**: Fixed
- **VERIFIED**: Filter chain enforces `Content-Type: application/json;charset=UTF-8` on all endpoints.

### BUG-003: String Substring Truncation Splitting Multi-Byte Tamil Characters
- **BUG**: Truncating Tamil descriptions in RSS/XML feeds could cut a multi-byte Tamil codepoint in half, creating invalid XML or `?` characters.
- **WHERE FOUND**: Backend SEO Controller (`backend/src/main/java/com/kingstv/controllers/SeoController.java`).
- **ROOT CAUSE**: Raw `substring(0, 297)` call without Unicode codepoint boundary checks.
- **FIX**: Used `desc.offsetByCodePoints(0, Math.min(297, desc.codePointCount(0, desc.length())))` for safe Unicode truncation.
- **STATUS**: Fixed
- **VERIFIED**: Tested RSS feed generation; XML renders valid Tamil text without surrogate pair truncation errors.

### BUG-004: Admin Panel Missing Tamil Font Fallback
- **BUG**: Tamil text in Admin Dashboard could render with browser system default fallback fonts rather than Noto Sans Tamil.
- **WHERE FOUND**: Admin CSS (`admin/src/index.css`).
- **ROOT CAUSE**: `--font-sans` variable was set to `'Inter', system-ui, sans-serif` without `'Noto Sans Tamil'`.
- **FIX**: Updated `--font-sans` and `--font-title` in `admin/src/index.css` to include `'Noto Sans Tamil'`.
- **STATUS**: Fixed
- **VERIFIED**: Confirmed computed CSS `--font-sans` includes `'Noto Sans Tamil'`.

---

## Phase 1 — Systematic UI & Spacing Audit

### BUG-005: Layout Controls Misalignment in News Editor
- **BUG**: News creation/editor form layout controls wrapping incorrectly on smaller screen sizes.
- **WHERE FOUND**: Admin News Editor (`admin/src/pages/admin/NewsEditor.jsx`).
- **ROOT CAUSE**: Rigid grid container styles without responsive flex adjustments.
- **FIX**: Added flexible wrap containers and responsive input sizing.
- **STATUS**: Fixed
- **VERIFIED**: Inspected layout at 375px, 768px, and 1280px breakpoints.

### BUG-010: Hardcoded Localhost Admin Redirect in Frontend Login
- **BUG**: Logging in as Admin/Editor from the Frontend Portal attempted to redirect the user to `http://localhost:3000/admin/layout`, which failed in production environments.
- **WHERE FOUND**: Frontend Login Page (`frontend/src/pages/Login.jsx`).
- **ROOT CAUSE**: Static string assignment `window.location.href = 'http://localhost:3000/admin/layout'`.
- **FIX**: Replaced static localhost string with dynamic origin resolution: `${window.location.origin}/admin/layout`.
- **STATUS**: Fixed
- **VERIFIED**: Admin/Staff logins from frontend portal resolve to `{origin}/admin/layout` cleanly on live domains.

### BUG-011: Outdated Localhost Fallback API Endpoints
- **BUG**: API utilities fell back to `http://localhost:8080` or `http://localhost:5000` when build-time environment variables were unpopulated, resulting in silent API failures on production.
- **WHERE FOUND**: Frontend Utilities (`frontend/src/utils/api.js`, `authService.js`, `userService.js`).
- **ROOT CAUSE**: Legacy local development default constants.
- **FIX**: Updated fallback constants to production Render endpoint `https://kings-tv.onrender.com/api/v1`.
- **STATUS**: Fixed
- **VERIFIED**: Inspected build output; API calls target `https://kings-tv.onrender.com` when environment variable fallback triggers.

---

## Phase 2 — Functionality Bugs

### BUG-006: Missing Notification Preferences Configuration Endpoints
- **BUG**: System notification toggles in Admin panel failed to persist.
- **WHERE FOUND**: `NotificationPreferences.jsx` & `SystemConfigController.java`.
- **ROOT CAUSE**: Missing backend endpoint mapping for notification settings payload keys.
- **FIX**: Implemented `updateNotificationPreferences` endpoint and mapped keys in `SystemConfig.java`.
- **STATUS**: Fixed
- **VERIFIED**: Endpoints respond with HTTP 200 OK and persist configuration in DB.

### BUG-007: Article Priority Calculation Missing Autonomous Cron Handler
- **BUG**: Priority scores were static and not auto-calculated based on article age decay and pageviews.
- **WHERE FOUND**: Backend (`ArticlePriorityService.java`).
- **ROOT CAUSE**: Priority scoring logic was absent.
- **FIX**: Created `ArticlePriorityService` with an hourly `@Scheduled` task calculating scores from view counts and age decay.
- **STATUS**: Fixed
- **VERIFIED**: Priority scores compute and render in `NewsManagement.jsx` table.

---

## Phase 3 — Redirect & Navigation Bugs

### BUG-008: Admin Login Redirect Bouncing to Frontend Website
- **BUG**: Logging into Admin Portal (`/admin/login`) redirected users to the main Frontend website.
- **WHERE FOUND**: Frontend / Admin React App (`admin/src/pages/Login.jsx`, `admin/src/api.js`, `admin/src/App.jsx`).
- **ROOT CAUSE**:
  1. `Login.jsx` navigated to `/dashboard` instead of `/admin/dashboard`.
  2. `api.js` interceptor redirected 401 errors to `/login` instead of `/admin/login`.
  3. `App.jsx` protected layout fell back to `/login` instead of `/admin/login`.
  4. Missing `.htaccess` rewrite rules for `/admin/` SPA routing on Hostinger Apache.
- **FIX**: Updated `Login.jsx`, `api.js`, `App.jsx`, `Sidebar.jsx`, `Header.jsx`, `Breadcrumbs.jsx`, and added `admin/public/.htaccess` SPA fallback rules.
- **STATUS**: Fixed
- **VERIFIED**: Tested login flow; user lands on `/admin/dashboard` cleanly.

---

## Phase 4 — Full Codebase Error & Build Analysis

### BUG-009: Missing Repository Imports in RSS Aggregator Service
- **BUG**: Backend compilation failure during `mvn clean package`.
- **WHERE FOUND**: Backend (`RssAggregatorService.java` & `RssAggregatorController.java`).
- **ROOT CAUSE**: Missing import statements for `RssFeedConfigRepository` and `existsByCanonicalUrl` query method.
- **FIX**: Added imports, added `existsByCanonicalUrl` to `ArticleRepository`, and implemented `getLatestItems()` in `RssAggregatorService`.
- **STATUS**: Fixed
- **VERIFIED**: Clean Java compilation and package build output.

---

**Summary**: Phase 0 and Phase 1 findings have been fully audited, logged, fixed at the root layer, and verified.
