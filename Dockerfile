# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy all source files
COPY . .

# Install root dependencies and workspace dependencies
RUN pnpm install

# Build the project
RUN pnpm run build::mcp

# Expose default MCP server port
ENV PORT=8080
EXPOSE 8080

# Start the MCP server
CMD ["pnpm", "start::mcp"]