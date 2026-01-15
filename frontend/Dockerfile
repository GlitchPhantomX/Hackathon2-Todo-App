# ---------------------------
# Stage 1: Builder
# ---------------------------
    FROM node:20-bullseye-slim AS builder

    RUN apt-get update && apt-get install -y curl bash git python3 build-essential && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    
    COPY package.json package-lock.json ./
    RUN npm ci --legacy-peer-deps
    
    COPY . .
    RUN npm run build
    
    # ---------------------------
    # Stage 2: Runtime
    # ---------------------------
    FROM node:20-bullseye-slim AS runner
    
    RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    
    # Non-root user
    RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs
    
    # Copy built files
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Copy start script
    COPY start.sh .
    RUN chmod +x start.sh
    
    USER nextjs
    
    EXPOSE 3000
    
    # Healthcheck
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
        CMD curl -f http://localhost:3000/ || exit 1
    
    # Start app using runtime env
    CMD ["./start.sh"]
    