# Production Dockerfile for the Express/MongoDB backend.
# Build:  docker build -t ecommerce-backend .
# Run:    docker run -p 5000:5000 --env-file .env ecommerce-backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
