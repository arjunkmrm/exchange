# Multi-stage build for resource efficiency
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Stage 1: Dependencies (minimal - just for workspace structure)
FROM base AS deps
# Copy package.json files for all packages
COPY package.json ./
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/sdk/package.json ./packages/sdk/

# Skip root install - we'll install per package as needed

# Stage 2: Build
FROM base AS builder
# Copy workspace structure from deps stage
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/packages/mcp/package.json ./packages/mcp/package.json
COPY --from=deps /app/packages/sdk/package.json ./packages/sdk/package.json

# Copy source code
COPY packages/sdk ./packages/sdk
COPY packages/mcp ./packages/mcp

# Build SDK first - install its deps then build
WORKDIR /app/packages/sdk
RUN pnpm install
RUN pnpm build

# Build MCP - install its deps then build
WORKDIR /app/packages/mcp
RUN pnpm install
RUN pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runtime

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy package.json files
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/sdk/package.json ./packages/sdk/

# Install only production dependencies, skip prepare scripts
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/packages/sdk/dist ./packages/sdk/dist
COPY --from=builder /app/packages/mcp/dist ./packages/mcp/dist

# Copy package.json files for runtime
COPY --from=builder /app/packages/sdk/package.json ./packages/sdk/
COPY --from=builder /app/packages/mcp/package.json ./packages/mcp/

# Set working directory to MCP package
WORKDIR /app/packages/mcp

# Expose port (Smithery will set PORT=8081)
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8081) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "dist/index.js"]
