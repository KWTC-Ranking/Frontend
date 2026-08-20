# VITE_API_BASE_URL is baked into the JS bundle at build time (Vite env vars aren't a runtime
# thing for a static SPA) — changing the backend URL means rebuilding this image, not just
# restarting the container. See README's Deployment section.
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
