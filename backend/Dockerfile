FROM node:18

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy-peer-deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy configuration files
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code and remaining files
COPY . .

# Build the application
RUN npm run build

# Set environment variable
ENV PORT=3001
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"] 