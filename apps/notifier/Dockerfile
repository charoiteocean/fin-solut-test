FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json nest-cli.json ./
COPY apps ./apps
COPY libs ./libs
RUN npm ci
RUN npm run build:notifier

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/apps/notifier/main.js"]
