FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN cat public/chat-fix.js public/pwa.js public/cars-nav.js public/cars-premium.js public/car-catalog.js public/cars-app.js public/cars-pro.js public/cars-pro-max.js public/cars-price-fix.js public/cars-loader-recovery.js >> public/site.js
RUN node patch-ai-booking.mjs
RUN node patch-admin-ai.mjs
RUN node patch-marketplace.mjs
RUN node patch-marketplace-optional-year.mjs
RUN node patch-cars-performance.mjs
RUN node patch-cars-fast-api.mjs
RUN node patch-cars-inline-bootstrap.mjs
RUN node patch-admin-marketplace.mjs
RUN node patch-booking-media.mjs

ENV NODE_ENV=production
CMD ["npm", "start"]
