# 🚨 RescueNow — Development Prompt

> Use this prompt to guide AI-assisted development or as a comprehensive brief for your development team.

---

## 🎯 Project Overview

**App Name:** RescueNow (working title)
**Concept:** A mobile-first, one-tap emergency response app for everyday home and vehicle breakdowns. Think "911 for daily breakdowns" — not a services marketplace.

**Core Idea:** User taps one button → selects emergency type → app auto-detects location → broadcasts to nearest verified providers → first to accept gets the job → payment held in escrow → released only after user confirms fix.

---

## 📱 What to Build

### Apps Required
1. **User App** (React Native / Expo + NativeWind) — iOS & Android
2. **Provider App** (React Native / Expo + NativeWind) — iOS & Android
3. **Admin Panel** (React + Tailwind CSS v3) — Desktop browser

### Backend — NestJS (TypeScript)

| Concern | Technology | Package(s) |
|---|---|---|
| **Framework** | NestJS | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` |
| **Database** | PostgreSQL | `@nestjs/typeorm`, `typeorm`, `pg` |
| **Auth** | JWT + Passport | `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `bcrypt` |
| **File Uploads** | Multer + Sharp | `@nestjs/platform-express` (includes Multer), `multer`, `sharp` |
| **Validation** | Class Validator | `class-validator`, `class-transformer` |
| **Config** | Env-based | `@nestjs/config`, `dotenv` |
| **Real-time** | WebSockets | `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` |
| **Caching** | Redis | `@nestjs/cache-manager`, `cache-manager-redis-store`, `ioredis` |
| **Payments** | Razorpay | `razorpay` |
| **Notifications** | FCM + SMS | `firebase-admin`, `twilio` |
| **API Docs** | Swagger | `@nestjs/swagger`, `swagger-ui-express` |
| **Rate Limiting** | Throttle | `@nestjs/throttler` |
| **Scheduling** | Cron Jobs | `@nestjs/schedule` |
| **Logging** | Winston | `nest-winston`, `winston` |

### Mobile App Packages (React Native / Expo)

| Concern | Package(s) |
|---|---|
| **Styling** | `nativewind`, `tailwindcss` (NativeWind v4) |
| **Navigation** | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` |
| **Maps** | `react-native-maps` or `react-native-mapbox-gl` |
| **Location** | `expo-location` |
| **Camera / Image** | `expo-image-picker`, `expo-camera` |
| **Notifications** | `expo-notifications`, `@react-native-firebase/messaging` |
| **Storage (local)** | `@react-native-async-storage/async-storage` |
| **HTTP Client** | `axios` |
| **Real-time** | `socket.io-client` |
| **State Management** | `zustand` or `@reduxjs/toolkit`, `react-query` / `@tanstack/react-query` |
| **Forms** | `react-hook-form`, `zod` |
| **Animations** | `react-native-reanimated`, `lottie-react-native` |
| **Haptics** | `expo-haptics` |
| **Secure Storage** | `expo-secure-store` |
| **Status Bar** | `expo-status-bar` |
| **Splash Screen** | `expo-splash-screen` |

### Admin Panel Packages (React Web)

| Concern | Package(s) |
|---|---|
| **Framework** | `react`, `react-dom`, `vite` |
| **Styling** | `tailwindcss`, `postcss`, `autoprefixer` |
| **Routing** | `react-router-dom` |
| **HTTP** | `axios` |
| **State** | `@tanstack/react-query`, `zustand` |
| **Charts** | `recharts` or `chart.js` + `react-chartjs-2` |
| **Tables** | `@tanstack/react-table` |
| **Forms** | `react-hook-form`, `zod` |
| **Icons** | `lucide-react` or `react-icons` |
| **Toasts** | `react-hot-toast` or `sonner` |

---

## 🏗️ NestJS Backend Structure

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── auth/                    # Auth Module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── dto/
│   │       ├── send-otp.dto.ts
│   │       └── verify-otp.dto.ts
│   │
│   ├── users/                   # Users Module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/
│   │       ├── user.entity.ts
│   │       └── user-address.entity.ts
│   │
│   ├── providers/               # Service Providers Module
│   │   ├── providers.module.ts
│   │   ├── providers.controller.ts
│   │   ├── providers.service.ts
│   │   └── entities/
│   │       ├── provider.entity.ts
│   │       ├── provider-skill.entity.ts
│   │       └── provider-location.entity.ts
│   │
│   ├── emergencies/             # Emergencies (Jobs) Module
│   │   ├── emergencies.module.ts
│   │   ├── emergencies.controller.ts
│   │   ├── emergencies.service.ts
│   │   ├── matching.service.ts         # GPS-based provider matching
│   │   └── entities/
│   │       └── emergency.entity.ts
│   │
│   ├── categories/              # Emergency Categories Module
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── entities/
│   │       └── category.entity.ts
│   │
│   ├── payments/                # Payment & Escrow Module
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── razorpay.service.ts
│   │   └── entities/
│   │       └── payment.entity.ts
│   │
│   ├── reviews/                 # Reviews Module
│   │   ├── reviews.module.ts
│   │   ├── reviews.controller.ts
│   │   ├── reviews.service.ts
│   │   └── entities/
│   │       └── review.entity.ts
│   │
│   ├── disputes/                # Disputes Module
│   │   ├── disputes.module.ts
│   │   ├── disputes.controller.ts
│   │   ├── disputes.service.ts
│   │   └── entities/
│   │       └── dispute.entity.ts
│   │
│   ├── uploads/                 # File Upload Module
│   │   ├── uploads.module.ts
│   │   ├── uploads.controller.ts
│   │   ├── uploads.service.ts          # Multer config + Sharp processing
│   │   └── multer.config.ts
│   │
│   ├── notifications/           # Notifications Module
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── fcm.service.ts
│   │   └── sms.service.ts
│   │
│   ├── gateway/                 # WebSocket Gateway (Real-time)
│   │   ├── events.module.ts
│   │   └── events.gateway.ts          # Socket.IO for live tracking & alerts
│   │
│   ├── admin/                   # Admin Module
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   └── admin.service.ts
│   │
│   └── common/                  # Shared utilities
│       ├── decorators/
│       ├── filters/
│       ├── guards/
│       ├── interceptors/
│       └── pipes/
│
├── uploads/                     # 📁 Local file storage (Multer destination)
│   ├── profiles/
│   ├── id-proofs/
│   ├── emergency-photos/
│   └── dispute-evidence/
│
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 File Upload Implementation (Multer + Sharp)

```typescript
// uploads/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const name = uuid();
      const ext = extname(file.originalname);
      cb(null, `${name}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
};
```

```typescript
// uploads/uploads.service.ts
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

export class UploadsService {
  async processAndSave(
    file: Express.Multer.File,
    subfolder: string, // 'profiles' | 'id-proofs' | 'emergency-photos' | 'dispute-evidence'
  ): Promise<string> {
    const outputDir = path.join('./uploads', subfolder);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filename = `${Date.now()}-${path.parse(file.originalname).name}.webp`;
    const outputPath = path.join(outputDir, filename);

    await sharp(file.buffer || file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Clean up original temp file if using disk storage
    if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return `/${subfolder}/${filename}`;
  }
}
```

---

## 🔧 Feature Breakdown

### User App — Build These Screens & Features

#### 1. Onboarding & Auth
- Phone number + OTP login (no passwords)
- Minimal profile setup: Name, saved addresses (Home, Work)
- Skip-friendly onboarding (get to emergency mode fast)

#### 2. Home Screen — Emergency Dashboard
- **BIG red emergency button** (center of screen) — this IS the app
- Category quick-select chips below:
  - ⚡ Electricity
  - 💧 Water / Plumbing
  - 🚗 Vehicle
  - ❄️ Appliance (AC, Fridge, etc.)
- Recent emergencies list at bottom
- **Styled with NativeWind** — dark mode, gradient backgrounds, smooth shadows

#### 3. Emergency Flow (Core)
```
Step 1: Tap emergency button / category
Step 2: Auto-detect GPS location (show on map, allow manual adjust)
Step 3: Smart questionnaire (2-3 questions based on category)
         Example for Electricity:
           - "Is there sparking or burning smell?" (Yes/No)
           - "Is the issue in one room or entire house?" (Single/Whole)
           - "Optional: Add a photo or voice note"
         → Photos uploaded via expo-image-picker → sent to NestJS uploads endpoint
         → Sharp processes: resize, compress to WebP, save to uploads/emergency-photos/
Step 4: "Finding help..." screen with animated radar/pulse (Reanimated + Lottie)
Step 5: Provider matched — show:
         - Provider name, photo, rating, distance, ETA
         - Upfront price quote
         - Accept / Find Another button
Step 6: Live tracking — provider moving towards user on map (Socket.IO real-time)
Step 7: Service in progress — timer + in-app call/chat
Step 8: Resolution confirmation:
         - "Is your issue resolved?" (Yes / No / Partially)
         - If Yes → Payment released, rate provider
         - If No → Dispute flow (upload evidence photos) / find another provider
```

#### 4. Payment
- Razorpay integration with escrow flow
- UPI, debit/credit card, wallet support
- Auto-hold on job acceptance, auto-release on confirmation
- Refund flow for unresolved issues

#### 5. History & Receipts
- Past emergency list with status, provider, cost
- Downloadable invoice/receipt
- Re-book same provider option

#### 6. Profile & Settings
- Saved addresses
- Payment methods
- Language preference (Hindi / English)
- Notification preferences
- Emergency contacts (future)

---

### Provider App — Build These Screens & Features

#### 1. Onboarding & Verification
- Phone + OTP login
- Multi-step verification:
  - Personal details + profile photo upload → Sharp compresses → `uploads/profiles/`
  - Aadhaar / ID upload → Sharp processes → `uploads/id-proofs/`
  - Skill category selection (can select multiple)
  - Service area radius setting
- Pending approval state (admin must verify)

#### 2. Dashboard
- Online/Offline toggle (prominent)
- Incoming job alerts with:
  - Category, distance, user's issue summary
  - Estimated earnings
  - Accept / Decline (with timer — auto-decline after 30s)
- Active job card (if currently on a job)
- Today's earnings summary

#### 3. Job Flow
```
Step 1: Receive alert via Socket.IO → See issue details + photos + location
Step 2: Accept → Set upfront price (within category range)
Step 3: Navigate to user (in-app map directions)
Step 4: Arrive → Mark "Arrived"
Step 5: Fix issue → Mark "Completed"
Step 6: Wait for user confirmation → Payment released
```

#### 4. Earnings & Payouts
- Daily/weekly/monthly earnings breakdown
- Payout history
- Bank account / UPI setup for fast payouts

#### 5. Profile & Ratings
- View own reliability score
- See user ratings and feedback
- Update skills, availability hours, service radius

---

### Admin Panel — Build These Pages (React + Tailwind CSS)

#### 1. Dashboard
- Live metrics: active emergencies, online providers, today's revenue
- Response time trends, resolution rates (Recharts)

#### 2. Provider Management
- Verification queue (pending applications) — view uploaded ID images
- Approve/reject with notes
- View provider profiles, ratings, job history
- Ban/suspend providers

#### 3. User Management
- User list with activity (@tanstack/react-table)
- Handle complaints and disputes

#### 4. Dispute Resolution
- View disputed jobs
- See evidence photos (served from `uploads/dispute-evidence/`)
- Issue refunds or release payments

#### 5. Financial Overview
- Revenue breakdown (convenience fees, commissions)
- Payout tracking
- Escrow status monitoring

#### 6. Settings
- Category management (add/edit emergency types)
- Pricing rules (min/max per category)
- Surge pricing rules (future)
- Notification templates

---

## 🎨 Design Guidelines

### Visual Identity
- **Primary Color:** Emergency Red (`#E63946`) — urgency, attention
- **Secondary Color:** Deep Navy (`#1D3557`) — trust, reliability
- **Accent Color:** Safety Green (`#2A9D8F`) — confirmation, success
- **Background:** Dark mode default (`#0F1923`) — premium, easy on eyes in panic
- **Typography:** Inter or Outfit (Google Fonts) — clean, modern, highly legible

### NativeWind Tailwind Config (Mobile)
```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emergency: { DEFAULT: '#E63946', dark: '#C62828' },
        navy: { DEFAULT: '#1D3557', light: '#264573', dark: '#0F1923' },
        success: { DEFAULT: '#2A9D8F', light: '#3DB8A9' },
        surface: { DEFAULT: '#1A2332', light: '#243447' },
      },
      fontFamily: {
        inter: ['Inter'],
        outfit: ['Outfit'],
      },
    },
  },
  plugins: [],
};
```

### UX Principles
1. **Panic-proof design** — large tap targets, minimal text, zero ambiguity
2. **One-hand operable** — all critical actions reachable by thumb
3. **< 3 taps to help** — from app open to request sent
4. **Calming feedback** — smooth animations, haptic feedback, reassuring copy
5. **Offline-resilient** — cache providers, SMS fallback
6. **Accessibility** — high contrast, screen reader support, large fonts option

### Animation Suggestions
- Pulsing radar animation during provider search (Lottie)
- Smooth map transitions for live tracking (Reanimated)
- Confetti or checkmark animation on successful resolution (Lottie)
- Subtle breathing glow on emergency button (Reanimated)

---

## 🗃️ Database Schema (PostgreSQL + TypeORM)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    profile_photo VARCHAR(500),          -- path in uploads/profiles/
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),                   -- 'Home', 'Work', etc.
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Providers
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    photo_url VARCHAR(500),              -- path in uploads/profiles/
    id_proof_url VARCHAR(500),           -- path in uploads/id-proofs/
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected | suspended
    reliability_score DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provider_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id)
);

CREATE TABLE provider_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    smart_questions JSONB                -- Array of question objects
);

-- Emergencies (Jobs)
CREATE TABLE emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES providers(id),
    category_id UUID REFERENCES categories(id),
    status VARCHAR(30) DEFAULT 'pending', -- pending | matched | accepted | arrived | in_progress | completed | confirmed | disputed
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    questionnaire_answers JSONB,
    photo_urls JSONB,                     -- Array of paths in uploads/emergency-photos/
    quoted_price DECIMAL(10, 2),
    escrow_status VARCHAR(20),            -- held | released | refunded
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    arrived_at TIMESTAMP,
    completed_at TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES emergencies(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30),
    escrow_status VARCHAR(20),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    paid_at TIMESTAMP,
    released_at TIMESTAMP,
    refunded_at TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES emergencies(id),
    user_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES providers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emergency_id UUID REFERENCES emergencies(id),
    raised_by VARCHAR(10),               -- 'user' | 'provider'
    reason TEXT,
    evidence_urls JSONB,                  -- Array of paths in uploads/dispute-evidence/
    status VARCHAR(20) DEFAULT 'open',    -- open | resolved | rejected
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial Index for provider matching
CREATE INDEX idx_provider_location ON provider_locations USING GIST (
    ST_MakePoint(longitude, latitude)
);
```

> [!NOTE]
> Install the PostGIS extension for spatial queries: `CREATE EXTENSION IF NOT EXISTS postgis;`

---

## 🔌 API Endpoints (NestJS Controllers)

```
Auth Module (/api/auth):
  POST   /send-otp          → Send OTP to phone
  POST   /verify-otp        → Verify OTP, return JWT
  GET    /me                 → Get current user (JWT protected)

Users Module (/api/users):
  PUT    /profile            → Update profile + photo upload
  POST   /addresses          → Add saved address
  GET    /addresses          → List saved addresses

Emergencies Module (/api/emergencies):
  POST   /                   → Create emergency (with photo uploads)
  GET    /:id/status         → Get emergency status
  POST   /:id/confirm        → Confirm resolution → release escrow
  POST   /:id/dispute        → Raise dispute (with evidence uploads)
  GET    /history             → Past emergencies

Categories Module (/api/categories):
  GET    /                   → List all categories + smart questions

Providers Module (/api/providers):
  POST   /register           → Provider registration (with ID upload)
  PUT    /toggle-online      → Go online/offline
  PUT    /update-location    → Update GPS coordinates
  GET    /incoming-jobs      → Get nearby emergency requests
  POST   /accept-job/:id     → Accept job + set price
  PUT    /job/:id/arrived    → Mark arrived
  PUT    /job/:id/completed  → Mark completed
  GET    /earnings            → Earnings dashboard data

Reviews Module (/api/reviews):
  POST   /                   → Create review + rating

Uploads Module (/api/uploads):
  POST   /image              → Upload single image (Multer + Sharp)
  POST   /images             → Upload multiple images
  GET    /:subfolder/:filename → Serve uploaded file (static)

Payments Module (/api/payments):
  POST   /create-order       → Create Razorpay order
  POST   /verify             → Verify payment signature
  POST   /refund/:id         → Initiate refund

Admin Module (/api/admin):
  GET    /dashboard-stats     → Live metrics
  GET    /providers/pending   → Verification queue
  PUT    /providers/:id/approve → Approve provider
  PUT    /providers/:id/reject  → Reject provider
  GET    /disputes             → List disputes
  PUT    /disputes/:id/resolve → Resolve dispute

WebSocket Gateway (Socket.IO):
  Event: 'provider:location-update'   → Real-time location tracking
  Event: 'emergency:status-change'    → Job status updates
  Event: 'emergency:new-request'      → Broadcast to nearby providers
  Event: 'chat:message'               → In-app messaging
```

---

## 🚀 Development Phases

### Phase 1 — MVP (Weeks 1-8)
- [ ] NestJS project setup (TypeORM + PostgreSQL + Multer + Sharp)
- [ ] Auth module (OTP + JWT)
- [ ] Users & Providers modules with file uploads
- [ ] Categories module with seed data
- [ ] Emergencies module + matching engine
- [ ] Payments module (Razorpay basic)
- [ ] User app: Auth, Emergency flow, Payment (NativeWind styling)
- [ ] Provider app: Auth, Verification, Job alerts, Accept flow
- [ ] Admin panel: Provider verification, basic dashboard (Tailwind CSS)
- [ ] Categories: Electricity + Vehicle only
- [ ] One city pilot

### Phase 2 — Enhanced (Weeks 9-16)
- [ ] WebSocket gateway for live tracking
- [ ] In-app chat/call
- [ ] Add Plumbing + Appliance categories
- [ ] Rating & review system
- [ ] Provider earnings dashboard
- [ ] Expand to 3 cities

### Phase 3 — Scale (Weeks 17-24)
- [ ] Surge pricing logic
- [ ] Provider subscription tiers
- [ ] Insurance/warranty partnerships
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Consider migrating uploads/ to cloud storage (S3) if needed
- [ ] Pan-India Tier-1 rollout

---

## ⚡ Quick Start Prompt (for AI Code Generation)

> **Copy this condensed prompt to start building:**

```
Build a mobile app called "RescueNow" — a one-tap emergency response app
for home & vehicle breakdowns.

TECH STACK:
- Mobile: React Native (Expo) + NativeWind (Tailwind CSS for RN)
- Backend: NestJS (TypeScript) + TypeORM + PostgreSQL
- File Uploads: Multer + Sharp → local uploads/ folder (WebP, compressed)
- Auth: JWT + Passport (phone OTP)
- Payments: Razorpay (escrow hold/release)
- Real-time: Socket.IO via @nestjs/websockets
- Cache: Redis via @nestjs/cache-manager
- Admin Panel: React + Vite + Tailwind CSS v3

CORE FLOW:
1. User taps big red emergency button
2. Selects category (Electricity/Water/Vehicle/Appliance)
3. App auto-detects GPS location
4. Shows 2-3 smart questions + optional photo upload
5. Broadcasts to nearest verified providers
6. First provider to accept gets the job, sets upfront price
7. Payment held in escrow (Razorpay)
8. Live tracking of provider (Socket.IO)
9. User confirms fix → payment released
10. If not fixed → upload evidence photos → refund/dispute

DESIGN: Dark mode, premium feel, emergency red (#E63946) + navy (#1D3557).
Large tap targets, panic-proof UX. Pulsing radar animation (Lottie).
Inter/Outfit font. NativeWind for all styling. < 3 taps to get help.

Start with NestJS backend setup, then User App emergency flow.
```

---

> [!TIP]
> Start with the **NestJS backend** (auth + uploads + emergencies modules), then build the **User App emergency flow**. Everything else supports this core loop.
