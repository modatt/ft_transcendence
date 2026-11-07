# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
# Copy only the manifests first so `npm ci` is cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

# Development: Vite dev server with hot reload. Compose bind-mounts the source over /app.
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build
COPY . .
RUN npm run build

# Production: static files only, served by an nginx that runs as a non-root user.
# HTTPS is terminated by the main nginx in front of this container, not here.
FROM nginxinc/nginx-unprivileged:stable-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
