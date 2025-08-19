# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Disable npm cache to prevent digest mismatches
ENV NPM_CONFIG_CACHE=false
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies including dev dependencies for build
RUN npm ci --include=dev --no-cache

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]