FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build


FROM node:25-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/public/uploads \
    && chown -R node:node /app/public

USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]