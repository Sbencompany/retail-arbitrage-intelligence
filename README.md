# 🏪 Retail Arbitrage Intelligence (RAI)

Enterprise SaaS platform for retail arbitrage — automatically discovers deals, compares marketplaces, calculates ROI, estimates demand, and recommends purchases with AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm 10+

### 1. Clone and Install
```bash
git clone https://github.com/Sbencompany/retail-arbitrage-intelligence.git
cd retail-arbitrage-intelligence
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API credentials
```

### 3. Start Infrastructure
```bash
docker-compose up -d postgres redis elasticsearch rabbitmq prometheus grafana loki
```

### 4. Database Setup
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

### Demo Login
- admin@retailarbitrage.com / Admin@123! (Admin)
- demo@retailarbitrage.com / Demo@123! (Pro User)

## 🏗️ Architecture

Frontend: Next.js 14 + TypeScript + Tailwind + TanStack Query + Zustand
Backend: NestJS + TypeScript + Prisma
Database: PostgreSQL 16
Cache: Redis 7
Queues: BullMQ
Monitoring: Prometheus + Grafana + Loki
Containerization: Docker + Kubernetes

## 🔌 External APIs Integrated

### Marketplace
- Amazon SP-API (LWA OAuth2) — catalog, pricing, fees
- Walmart Marketplace API (OAuth2) — items, clearance
- eBay Browse API (OAuth2) — search, sold listings
- Best Buy API (API Key) — deals, clearance

### Shipping
- USPS Web Tools (UserID) — domestic rates
- UPS REST API (OAuth2) — rate quotes
- FedEx REST API (OAuth2) — rate quotes

### AI and Alerts
- OpenAI GPT-4o-mini — AI recommendations
- Nodemailer (SMTP) — email alerts
- Telegram Bot API — Telegram notifications
- Twilio — WhatsApp notifications

## 📦 Engines

1. **Deal Discovery Engine** — Scans 11 stores every 2 hours via BullMQ
2. **Marketplace Intelligence** — Amazon/Walmart/eBay price comparison
3. **Product Matching** — UPC/ASIN/EAN matching with confidence scores
4. **Freight Engine** — USPS/UPS/FedEx quotes with dimensional weight
5. **Profitability Engine** — FBA/FBM/Walmart/eBay fee calculation + ROI
6. **Demand Estimation** — BSR to sales conversion + scoring (0-100)
7. **AI Recommendation** — Rule-based + OpenAI (BUY/HOLD/AVOID + quantity)
8. **Alert Engine** — Email/Telegram/WhatsApp/Push multi-channel
9. **Geolocation Engine** — Haversine formula, nearby stores and deals

## 🧪 Testing
```bash
npm run test        # Unit tests (coverage > 85%)
npm run test:e2e    # E2E tests
npm run lint        # ESLint
npm run type-check  # TypeScript
```

## 📊 Monitoring
- Grafana: http://localhost:3100 (admin/admin123)
- Prometheus: http://localhost:9090
- Swagger API Docs: http://localhost:3001/docs
- RabbitMQ: http://localhost:15672

## ✅ Validation Checklist
- [x] Authentication JWT + OAuth Google
- [x] Deal Discovery Engine (Walmart + Best Buy APIs)
- [x] Marketplace Intelligence (Amazon + Walmart + eBay)
- [x] Product Matching (UPC/ASIN/EAN)
- [x] Freight Engine (USPS + UPS + FedEx)
- [x] Profitability Engine (FBA/FBM/Walmart/eBay)
- [x] Demand Estimation (BSR scoring)
- [x] AI Recommendation Engine
- [x] Alert Engine (4 channels)
- [x] Geolocation Engine
- [x] Dashboard with charts
- [x] All CRUD pages
- [x] PostgreSQL + Prisma schema
- [x] Redis + BullMQ
- [x] Prometheus + Grafana + Loki
- [x] Docker Compose
- [x] Kubernetes manifests
- [x] GitHub Actions CI/CD
- [x] Unit tests
