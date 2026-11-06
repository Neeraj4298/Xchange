# ==============================================================================
# Xchange Monorepo — Multi-Stage Production Dockerfile (Node 22 LTS Alpine)
# Targets:
#   - api : Modular Monolith Backend Service (:4000)
#   - web : Next.js 15 Production Web Application (:3000)
# ==============================================================================

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Install workspace dependencies
FROM base AS deps
COPY package.json package-lock.json pnpm-workspace.yaml ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-sdk/package.json ./packages/api-sdk/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm ci

# 2. Copy source & build all workspaces
FROM deps AS builder
COPY . .
RUN npm run openapi:generate && npm run build

# 3. Target: Backend API Service (:4000)
FROM base AS api
ENV NODE_ENV=production
ENV API_PORT=4000
ENV API_HOST=0.0.0.0
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
WORKDIR /app/apps/api
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=4s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["npx", "tsx", "src/main.ts"]

# 4. Target: Next.js 15 Web Application (:3000)
FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web
WORKDIR /app/apps/web
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=4s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["npm", "run", "start"]
