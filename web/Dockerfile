##
# Dockerfile for the web service

FROM node:18-alpine AS builder
WORKDIR /app

# Copy root manifests and workspace packages into the build stage. Copying
# tsconfig.base.json ensures that TypeScript extends correctly.
COPY package.json package-lock.json tsconfig.base.json ./
COPY common ./common
COPY web ./web

RUN npm install

RUN npm run build -w common -w web

### Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/web/dist ./dist


EXPOSE 4173

# Start the static server on port 4173. The `-s` flag serves static files from
# the `dist` directory, and `-l` specifies the listening port.
CMD ["serve", "-s", "dist", "-l", "4173"]