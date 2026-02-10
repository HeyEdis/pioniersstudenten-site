# Use the official public Bun image
FROM oven/bun:1

# Set the working directory
WORKDIR /app

# Copy dependency files first for caching
COPY package.json bun.lock ./

# Install dependencies (frozen-lockfile is default in Bun for CI/Docker)
RUN bun install

# Copy the rest of the project
COPY . .

# Build the Next.js application
# This runs "bun --bun next build" based on your package.json
RUN bun run build

RUN cp -r public .next/standalone/public

# 2. Create the .next directory inside standalone
RUN mkdir -p .next/standalone/.next

# 3. Copy the static assets (CSS, JS chunks)
RUN cp -r .next/static .next/standalone/.next/static
# Expose the port
EXPOSE 3000

# Start the application
# This runs "bun --bun next start" based on your package.json
CMD ["bun", ".next/standalone/server.js"]
