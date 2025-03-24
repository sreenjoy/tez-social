FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy-peer-deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variable
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 