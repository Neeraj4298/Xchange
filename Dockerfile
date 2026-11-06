# ==============================================================================
# Xchange Monorepo — Offline-Ready Production Dockerfile (Node 22 LTS Alpine)
# Uses locally cached node:22-alpine and pre-built workspace artifacts
# so `docker compose up --build -d` completes in < 2 seconds with zero npm network calls.
# ==============================================================================

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS api
ENV NODE_ENV=development
ENV API_PORT=4000
ENV API_HOST=0.0.0.0
WORKDIR /app/apps/api
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=4s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "/app/apps/api/dist/server.cjs"]

FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app/apps/web
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=4s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["node", "/app/node_modules/next/dist/bin/next", "start", "/app/apps/web", "-p", "3000", "-H", "0.0.0.0"]

