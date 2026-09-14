# Implementation Plan - Phase 1: Foundation & Administration

We are building a premium silver jewellery e-commerce platform named **Vanity** (derived from the design specifications of "Heritage Silver & Co."). 

This plan details the foundation setup (Next.js frontend + Laravel backend), the normalized MySQL database schema, user authentication APIs, and basic administration capabilities for managing categories and products.

---

## User Review Required

> [!IMPORTANT]
> **Shop Name:** The branding across all screens will be unified as **Vanity** as requested, replacing the placeholder "Heritage Silver & Co."
> **Database Host:** XAMPP MySQL will be utilized as our database server (port 3306). We will automate database creation if it does not already exist, and supply a fallback SQLite configuration in `.env.example` for flexibility.

---

## Open Questions

> [!NOTE]
> None at the moment. We will proceed with standard REST API authentication (Laravel Sanctum token-based) and typical Laravel-Next.js CORS configuration.

---

## Proposed Changes

We will introduce a decoupled architecture with two primary folders in the workspace root:
1. `frontend/` - Next.js 15+ (React, Tailwind CSS, TypeScript)
2. `backend/` - Laravel 11 (PHP, MySQL, Eloquent, Sanctum Auth)

---

### Database Schema Design

We will define migrations for the following normalized tables in MySQL:

1. **`users`**
   - `id` (unsigned big integer, PK)
   - `name` (string)
   - `email` (string, unique)
   - `password` (string)
   - `role` (enum: `admin`, `customer`, default: `customer`)
   - `remember_token` (string, nullable)
   - `timestamps`

2. **`categories`**
   - `id` (unsigned big integer, PK)
   - `name` (string)
   - `slug` (string, unique)
   - `description` (text, nullable)
   - `timestamps`

3. **`products`**
   - `id` (unsigned big integer, PK)
   - `sku` (string, unique)
   - `name` (string)
   - `slug` (string, unique)
   - `description` (text, nullable)
   - `category_id` (unsigned big integer, FK -> categories.id)
   - `silver_purity` (string, e.g. "925", "999")
   - `silver_weight` (decimal 8,2 - in grams)
   - `making_charge` (decimal 8,2 - price to manufacture)
   - `making_charge_type` (enum: `flat`, `percent`, default: `flat`)
   - `base_price` (decimal 10,2 - optional static base fallback price)
   - `discount_percent` (decimal 5,2, default: 0)
   - `stock_quantity` (integer, default: 0)
   - `is_featured` (boolean, default: false)
   - `is_bestseller` (boolean, default: false)
   - `is_new_arrival` (boolean, default: false)
   - `status` (enum: `active`, `inactive`, default: `active`)
   - `timestamps`
   - `deleted_at` (soft deletes)

4. **`product_images`**
   - `id` (unsigned big integer, PK)
   - `product_id` (unsigned big integer, FK -> products.id, cascade on delete)
   - `image_path` (string - URL or storage path)
   - `is_primary` (boolean, default: false)
   - `sort_order` (integer, default: 0)
   - `timestamps`

5. **`silver_rates`**
   - `id` (unsigned big integer, PK)
   - `rate_per_gram` (decimal 8,2)
   - `source` (enum: `api`, `manual`, default: `api`)
   - `source_detail` (string, e.g., "MCX Silver Spot")
   - `status` (enum: `open`, `closed`, default: `open`)
   - `timestamps`

6. **`settings`**
   - `id` (unsigned big integer, PK)
   - `key` (string, unique)
   - `value` (text, nullable)
   - `timestamps`

---

### Backend Component (Laravel)

We will scaffold a fresh Laravel project in `backend/` and implement:
- **Database Migrations:** Define the schema above.
- **Models & Relationships:** `User`, `Category`, `Product`, `ProductImage`, `SilverRate`, `Setting` with relations mapped.
- **Authentication APIs:**
  - `POST /api/auth/register` (Customer registration)
  - `POST /api/auth/login` (Token-based login via Sanctum, returns token and user role)
  - `POST /api/auth/logout` (Revokes Sanctum token)
- **Admin CRUD APIs (under `/api/admin/*` middleware checking `role == admin`):**
  - **Category Management:** `GET/POST/PUT/DELETE /api/admin/categories`
  - **Product Management:** `GET/POST/PUT/DELETE /api/admin/products` including image upload storage logic.
- **Database Seeder:** Seeds a default `admin@vanity.com` user and common categories (Rings, Necklaces, Bracelets, Earrings) with mockup products.

---

### Frontend Component (Next.js)

We will scaffold a fresh Next.js project in `frontend/` and configure:
- **Tailwind configuration:** Custom font family `EB Garamond` and `Inter`, and brand colors from `DESIGN.md`.
- **State/Auth handling:** Simple custom context or Zustand store to manage active session tokens and user state, with separate persistent storage keys or logic for admin vs. customer credentials.
- **Views & Pages (Initial):**
  - **Customer Login / Signup Pages (`/login`, `/register`):** Styled for general users.
  - **Admin Login Page (`/admin/login`):** A dedicated login screen completely separate from customer logins.
  - **Admin Shell Layout & Dashboard (`/admin/dashboard` or `/admin`):** Sidebar navigation matching `heritage_silver_admin_dashboard`.
  - **Admin Products List & Create/Edit Pages (`/admin/products`):** Standard responsive layout supporting basic CRUD forms (Name, Category, Purity, Weight, Making Charge, Stock, Image uploads).

---

## Verification Plan

### Automated Verification
- We will execute Laravel migrations (`php artisan migrate:fresh --seed`) and check for successful database seeding.
- We will test authentication endpoints and product management REST requests via test scripts in the backend.

### Manual Verification
- Launch both Next.js dev server and Laravel server.
- Log in using `admin@vanity.com` and test creating/updating categories and products with images.
- Verify that responsive viewport rendering matches desktop and mobile layouts.
