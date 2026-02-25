# STAGE 1: Builder
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG APP_ENV
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG LOG_LEVEL
ARG LOG_DISABLED
ARG BETTER_AUTH_SIGNUP_DISABLED
ENV NODE_ENV=production \
    APP_ENV=$APP_ENV \
    POSTGRES_DB=$POSTGRES_DB \
    POSTGRES_USER=$POSTGRES_USER \
    POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    LOG_LEVEL=$LOG_LEVEL \
    LOG_DISABLED=$LOG_DISABLED \
    BETTER_AUTH_SIGNUP_DISABLED=$BETTER_AUTH_SIGNUP_DISABLED
RUN bun run build

# STAGE 2: Runner (Dit is de enige laag die Docker uiteindelijk exporteert!)
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000