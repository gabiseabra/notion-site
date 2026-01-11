FROM node:18-alpine AS builder

WORKDIR /app

# copy only what is needed to install deps
COPY package.json package-lock.json ./
COPY web/package.json web/
COPY common/package.json common/

RUN npm ci

# copy sources
COPY web web
COPY common common
COPY tsconfig.json tsconfig.base.json ./

# build web
RUN npm run build -w web

# ---- runtime ----
FROM caddy:2-alpine

WORKDIR /app

# Copy the built static files and the Caddy configuration
COPY --from=builder /app/web/dist ./dist
COPY --from=builder /app/web/Caddyfile ./Caddyfile

EXPOSE 3030

# Start Caddy using the configuration file
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]