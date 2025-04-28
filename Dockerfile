# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for better layer caching
COPY package.json .
COPY package-lock.json .
COPY pnpm-workspace.yaml .

# Install root dependencies and workspace dependencies
RUN pnpm install

# Copy all source files
COPY . .

# Build the project
RUN pnpm run build

# Expose default MCP server port
EXPOSE 3000

# Start the MCP server
CMD ["pnpm", "start::mcp"]