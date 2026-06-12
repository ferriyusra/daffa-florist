# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────────────────────
# Base: Debian slim + openssl (dibutuhkan Prisma engine)
# ──────────────────────────────────────────────────────────────
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ──────────────────────────────────────────────────────────────
# Deps: install dependency (postinstall menjalankan `prisma generate`)
# ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ──────────────────────────────────────────────────────────────
# Builder: build Next.js (output: standalone)
# ──────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env dummy hanya agar validasi @t3-oss/env & next build lolos.
# Nilai asli di-inject saat runtime, bukan di-bake ke image.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXTAUTH_SECRET="build-time-placeholder"

RUN npm run build

# ──────────────────────────────────────────────────────────────
# Runner: image final yang ramping
# ──────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# User non-root
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Prisma CLI + schema/migrations untuk `prisma migrate deploy` saat start.
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma

# Artefak Next.js standalone.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Folder upload runtime (di-mount sebagai volume di production).
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
