# 1. Use the official public Bun image FIRST
FROM oven/bun:1

# Set the working directory
WORKDIR /app

# Copy dependency files first for caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the project
COPY . .

# 2. Declare the build arguments INSIDE the build stage
ARG APP_ENV
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL

# 3. Set them as environment variables (Notice the typo fix here)
ENV APP_ENV=$APP_ENV
ENV POSTGRES_DB=$POSTGRES_DB
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL

# 4. Build the Next.js application
# Now bun can actually see the variables!
RUN bun run build

RUN cp -r public .next/standalone/public

# Create the .next directory inside standalone
RUN mkdir -p .next/standalone/.next

# Copy the static assets (CSS, JS chunks)
RUN cp -r .next/static .next/standalone/.next/static

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", ".next/standalone/server.js"]