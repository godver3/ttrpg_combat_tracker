FROM node:18 as builder
ARG CACHEBUST=1
FROM node:18 as builder
ARG CACHEBUST=1
# Build stage
FROM node:18 AS builder
WORKDIR /app
RUN echo "$CACHEBUST" > /dev/null
RUN echo "$CACHEBUST" > /dev/null
COPY package*.json ./
RUN npm install
RUN npm install uuid
COPY . .
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app
RUN echo "$CACHEBUST" > /dev/null
RUN echo "$CACHEBUST" > /dev/null
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4006
CMD ["npm", "start"]
