FROM node:18-alpine AS builder

WORKDIR /app

# install deps
COPY package.json package-lock.json tsconfig.base.json ./
COPY api/package.json api/
COPY common/package.json common/

RUN npm ci

# copy sources
COPY common common
COPY api api

# build common first, then api
RUN npm run build -w common
RUN npm run build -w api

# -------- runtime --------
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

# copy api output
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/package.json ./api/package.json

# copy common *dist* and wire it into node_modules
COPY --from=builder /app/common/dist ./node_modules/@notion-site/common/dist
COPY --from=builder /app/common/package.json ./node_modules/@notion-site/common/package.json

# install api runtime deps only
COPY --from=builder /app/package.json ./package.json
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "api"]