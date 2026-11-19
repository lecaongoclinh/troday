FROM node:22-alpine AS build
WORKDIR /build
COPY FE_Web/package.json FE_Web/package-lock.json ./
RUN npm ci
COPY FE_Web/ ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /build/dist /srv
