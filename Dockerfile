FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development

# Install all dependencies including devDependencies
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY server/ ./server/
COPY src/ ./src/
COPY uploads/ ./uploads/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Copy source code
COPY tsconfig.json ./
COPY server/ ./server/
COPY src/ ./src/
COPY uploads/ ./uploads/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]