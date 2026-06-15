# Retail Arbitrage Intelligence (RAI)

> Enterprise SaaS platform for Retail Arbitrage Intelligence

Live demo: [retail-arbitrage-intelligence-cfrnh7not-sbencompanys-projects.vercel.app](https://retail-arbitrage-intelligence-cfrnh7not-sbencompanys-projects.vercel.app)

## Features
- Auto-discovers deals from Walmart, Target, Best Buy, Costco and more
- Compares prices across Amazon, Walmart Marketplace, and eBay
- Calculates ROI, profit margins, and shipping costs
- AI-powered recommendations using GPT-4
- Real-time alerts via Email, Telegram, WhatsApp

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** NestJS, PostgreSQL, Redis, BullMQ
- **AI:** OpenAI GPT-4o-mini
- **Monitoring:** Prometheus, Grafana, Loki

## Quick Start

```bash
git clone https://github.com/Sbencompany/retail-arbitrage-intelligence.git
cd retail-arbitrage-intelligence
cp .env.example .env
docker-compose up -d
npm install
npm run dev
```
