# --- STAGE 1: Build the React frontend ---
FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/. .

RUN npm run build

# --- STAGE 2: Serve the React app with Nginx ---
FROM nginx:1.25-alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from the previous stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]