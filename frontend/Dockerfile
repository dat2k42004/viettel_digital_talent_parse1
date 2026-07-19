# Stage 1: Build React/Vite application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package lock and install dependencies to optimize caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy full frontend codebase and compile build artifacts
COPY . .
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:stable-alpine
# Copy compiled web assets to default nginx route
COPY --from=build /app/dist /usr/share/nginx/html
# Override default Nginx server configuration with custom SPA-ready config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
