FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code (excluding frontend directory)
COPY . .

# Build the application
RUN npm run build

# Set environment variable
ENV PORT=3001
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the application in production mode
CMD ["npm", "run", "start:prod"] 