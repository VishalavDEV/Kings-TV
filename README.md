# Kings TV — Admin Panel & Public API Portal

A enterprise-grade News & Entertainment CMS built with a Spring Boot Java backend and React (Vite/TailwindCSS) Admin Panel.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java JDK**: Version 17 or higher
- **Node.js**: Version 18+ and `npm`
- **Database**: MySQL Server 8.0+

---

### 2. Backend Setup (`/backend`)

1. Copy `.env.example` to `.env` or set environment variables in your terminal:
   ```bash
   $env:DB_URL="jdbc:mysql://127.0.0.1:3306/kings_tv_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8"
   $env:DB_USER="root"
   $env:DB_PASSWORD="root"
   $env:JWT_SECRET="super_secret_kings_tv_token_key_1234_long_string_required_for_spring_boot_security"
   ```

2. Run the Spring Boot server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend will start at `http://localhost:8080`.

#### Default Admin Credentials
- **Email**: `admin@king24x7.com` (or `admin@kingstv.com`)
- **Password**: `admin123`

---

### 3. Admin Frontend Setup (`/admin-frontend`)

1. Install dependencies:
   ```bash
   cd admin-frontend
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=http://localhost:8080
   VITE_PUBLIC_SITE_URL=https://kings-tv.vercel.app/
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   The admin portal will open at `http://localhost:5173`.

---

## 🛡 System Architecture

### Shared Components
- **DataTable Component**: Supports column sorting, live debounced search, page size selection (10/15/25/50/100), per-row action dropdowns, bulk deletions, and confirm modals.
- **RichTextEditor Component**: Built-in toolbar formatting + inline Media Picker image insertion.
- **MediaPickerModal Component**: Media gallery picker, file drag-and-drop uploader, and web URL preview with alt text SEO support.
- **ToastContext**: Site-wide success, error, and info toasts.
- **RepeatableList**: Sub-item repeatable list manager with `#N` collapsible headers, order inputs, and item reordering.

---

## 📡 Key Public API Endpoints (`/api/public/**`)

- `GET /api/public/articles` — Public articles list with category, language, and pagination params
- `GET /api/public/articles/{slug}` — Single article detail by slug
- `POST /api/public/articles/{slug}/view` — Article view tracking and author accrued earnings computation
- `GET /api/public/categories` — Main categories and subcategories
- `GET /api/public/breaking-news` — Active breaking news ticker items
- `GET /api/public/settings` — Portal settings (logo, accent colors, social URLs, maintenance mode)
- `POST /api/public/comments` — Reader comment submission (creates pending comment)
- `POST /api/public/contact` — Contact form submission
- `POST /api/public/newsletter/subscribe` — Newsletter subscription

---

## 🔒 Security & CORS
- JWT authentication on `/api/admin/**` endpoints with server-side token invalidation via `POST /api/admin/auth/logout`.
- CORS allowed origins configured for `https://kings-tv.vercel.app` and local dev environments.
