FROM node:24-bookworm-slim AS build
WORKDIR /app/FE_Web
COPY FE_Web/package.json FE_Web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY shared /app/shared
COPY FE_Web ./
RUN npm run build

FROM nginx:1.28-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/FE_Web/dist /usr/share/nginx/html
EXPOSE 80
