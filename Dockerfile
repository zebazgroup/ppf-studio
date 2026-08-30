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
RUN cat public/chat-fix.js public/pwa.js public/global-v2.js public/home-hero-slider.js >> public/site.js
RUN node patch-ai-booking.mjs
RUN node patch-admin-ai.mjs
RUN node patch-marketplace.mjs
RUN node patch-marketplace-optional-year.mjs
RUN node patch-cars-fast-api.mjs
RUN node patch-admin-marketplace.mjs
RUN node patch-booking-media.mjs

ENV NODE_ENV=production
CMD ["npm", "start"]
