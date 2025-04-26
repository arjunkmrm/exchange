# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the project
RUN npm run build

# Expose default MCP server port
EXPOSE 3000

# Start the MCP server
CMD ["node", "dist/index.js"]