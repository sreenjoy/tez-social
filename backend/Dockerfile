FROM node:18

WORKDIR /app

# Copy critical config files first
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Copy source code before installing to ensure TypeScript can find the configuration
COPY src/ ./src/
COPY test/ ./test/

# Install dependencies with legacy-peer-deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy remaining files
COPY . .

# Build the application
RUN npm run build

# Set environment variable
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 