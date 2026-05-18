FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY server/ ./server/
COPY src/ ./src/
COPY client/ ./client/

# Build client
WORKDIR /app/client
RUN npm install && npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and client dist
COPY tsconfig.json ./
COPY server/ ./server/
COPY src/ ./src/
COPY --from=builder /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
