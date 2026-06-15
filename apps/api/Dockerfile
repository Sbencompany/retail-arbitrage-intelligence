# ─── Builder stage ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/ 2>/dev/null || true

RUN npm ci --workspace=apps/api --workspace=packages/database

COPY packages/database/prisma ./packages/database/prisma
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

COPY apps/api ./apps/api
COPY packages/database/src ./packages/database/src 2>/dev/null || true

RUN npm run build --workspace=apps/api

# ─── Production stage ──────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/database/prisma ./prisma

ENV NODE_ENV=production PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/health/ping || exit 1

USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
