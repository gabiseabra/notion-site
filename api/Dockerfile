##
# Dockerfile for the api service

FROM node:18-alpine AS builder

# Create an application directory. All subsequent commands are relative to this
# directory. Using a single work directory simplifies cache invalidation when
# copying files.
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY common ./common
COPY api ./api

RUN npm install

RUN npm run build -w common -w api

### Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/server.js"]