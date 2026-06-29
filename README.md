# Glamics Fashion E-Commerce — Full MERN Stack Application

A production-ready MERN (MongoDB, Express, React, Node.js) e-commerce platform converted from the Glamics HTML template.

---

## 🏗️ Project Structure

```
glamics/
├── server/          # Express + MongoDB API
│   ├── config/      # DB + Cloudinary config
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth, error, upload
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API endpoints
│   └── utils/       # Seed script
│
├── client/          # React storefront (port 5173)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route pages
│       ├── store/       # Redux slices
│       ├── services/    # API service
│       └── styles/      # CSS (full original template)
│
└── admin/           # React admin panel (port 5174)
    └── src/
        ├── components/  # Admin UI
        ├── pages/       # All admin pages
        └── store/       # Auth state
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 2. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

### 3. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/glamics
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 4. Seed Database

```bash
npm run seed
```

This creates:
- ✅ Admin user: `admin@glamics.com` / `admin123456`
- ✅ 7 featured categories
- ✅ 20 sample products with images
- ✅ 3 hero slides
- ✅ 8 promotional banners
- ✅ 8 FAQs
- ✅ 5 testimonials
- ✅ 3 blog posts
- ✅ 12 homepage sections

### 5. Start Development

```bash
npm run dev
```

| App | URL |
|-----|-----|
| 🛍️ Storefront | http://localhost:5173 |
| ⚙️ Admin Panel | http://localhost:5174 |
| 🔌 API Server | http://localhost:5000 |

---

## 🔐 Admin Panel Features

### Dashboard
- Revenue charts (last 30 days)
- Order statistics with pie chart
- Recent orders table
- Top selling products

### Product Management
- Full CRUD with image uploads via Cloudinary
- Size and color variant management
- SEO fields per product
- Inventory tracking
- Featured/New/Best Seller badges

### Order Management
- Full order listing with filters
- Status updates with tracking numbers
- Order history timeline
- Revenue analytics

### Content Management
- **Hero Slides** — Add/edit/reorder homepage banner slides
- **Banners** — Manage promotional, collection, ad, sale banners
- **Homepage Builder** — Drag to reorder sections, toggle visibility, edit config
- **Blog** — Full CMS with rich HTML content
- **FAQs** — Manage Q&A
- **Testimonials** — Customer quotes
- **Reviews** — Approve/reject product reviews
- **Media Library** — Upload and manage images

### Store Settings
- Store name, logo, favicon
- Contact info
- Social media links
- Commerce settings (currency, tax, shipping)
- Marketing (announcement bar, newsletter)
- SEO defaults

### User Management
- Customer list with search
- Role-based access (customer / admin / super_admin)

### Coupon Management
- Percentage and fixed-amount coupons
- Usage limits
- Expiry dates

---

## 🛍️ Storefront Features

- **Homepage** — Dynamic sections from CMS (hero, categories, products, ad, flash sale, reviews, blog, gallery)
- **Shop** — Full filtering (category, price, size, color), sorting, pagination
- **Product Detail** — Image gallery with zoom, size/color picker, reviews
- **Cart** — Persistent cart with Redux, quantity controls, coupon application
- **Checkout** — Multi-step (shipping → payment → review) with COD/card/PayPal
- **Wishlist** — Persistent for logged-in users
- **User Account** — Orders, profile, addresses, password change
- **Blog** — Listing and detail with tags/categories
- **About, Contact, FAQ** — Static CMS pages
- **Authentication** — JWT with refresh tokens

---

## 🗄️ API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/addresses` | Add address |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products (filterable) |
| GET | `/api/products/:slug` | Get single product |
| GET | `/api/products/:id/related` | Related products |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Delete (admin) |
| POST | `/api/products/:id/images` | Upload images (admin) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/my` | User's orders |
| GET | `/api/orders/admin/all` | All orders (admin) |
| GET | `/api/orders/admin/stats` | Revenue stats (admin) |
| PUT | `/api/orders/:id/status` | Update status (admin) |

*Plus categories, reviews, coupons, banners, hero, blog, faq, testimonials, settings, menus, media, cart, wishlist, upload endpoints.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Redux Toolkit, React Router v6 |
| Animations | Swiper 11, Splide 4, Animate.css |
| State | Redux Persist (cart, auth, wishlist survive reload) |
| Backend | Node.js, Express 4, Express Async Errors |
| Database | MongoDB, Mongoose 8 |
| Auth | JWT + Refresh Tokens, bcryptjs |
| Storage | Cloudinary |
| Admin Charts | Recharts |
| HTTP | Axios with auto-refresh interceptor |

---

## 📁 MongoDB Schemas

| Model | Purpose |
|-------|---------|
| User | Customers + admins with addresses, wishlist |
| Product | Full product with variants, images, SEO |
| Category | Hierarchical categories |
| Order | Complete order with items, shipping, status history |
| Review | Product reviews with approval workflow |
| Coupon | Percentage + fixed discount codes |
| Banner | All site banners by type |
| HeroSlide | Homepage hero carousel slides |
| Blog | Blog posts with SEO |
| FAQ | Frequently asked questions |
| Testimonial | Customer testimonials |
| Settings | Key-value store for all site config |
| Menu | Header/footer navigation |
| Media | Uploaded media library |
| HomepageSection | CMS-controlled homepage layout |

---

## 🚀 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/glamics
JWT_SECRET=<64-char-random-string>
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### Build
```bash
# Build storefront
cd client && npm run build

# Build admin panel
cd admin && npm run build
```

### Deploy Options
- **Railway / Render** — Connect GitHub repo, set env vars, auto-deploy
- **VPS (Ubuntu)** — Nginx + PM2 + Certbot SSL
- **Docker** — Dockerfile per service + docker-compose

---

## 📝 License

MIT — Free to use for personal and commercial projects.
