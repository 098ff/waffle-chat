FROM node:20-alpine

WORKDIR /app/backend

# Copy package.json and package-lock.json first
# This caches our dependencies
COPY backend/package*.json ./

RUN npm ci 

COPY backend/. .

EXPOSE 5000

CMD ["node", "server.js"]
