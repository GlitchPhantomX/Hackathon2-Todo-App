# ---------------------------
# Stage 1: Builder
# ---------------------------
    FROM node:20-bullseye-slim AS builder

    # Install build dependencies
    RUN apt-get update && apt-get install -y curl bash git python3 build-essential && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    
    # Copy package files first for caching
    COPY package.json package-lock.json ./
    
    # Configure npm with aggressive retry settings and install
    RUN npm ci --legacy-peer-deps
    
    # Copy rest of the app
    COPY . .
    
    # Build app - standalone output will handle dynamic pages at runtime
    RUN npm run build
    
    # ---------------------------
    # Stage 2: Production runner
    # ---------------------------
    FROM node:20-bullseye-slim AS runner
    
    # Install runtime dependencies
    RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    
    # Create non-root user
    RUN groupadd -g 1001 nodejs && \
        useradd -u 1001 -g nodejs -m nextjs
    
    # Copy built Next.js standalone files from builder
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Switch to non-root user
    USER nextjs
    
    # Expose port
    EXPOSE 3000
    
    # Health check
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
        CMD curl -f http://localhost:3000/ || exit 1
    
    # Start the app
    CMD ["node", "server.js"]