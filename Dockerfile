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
RUN cat public/chat-fix.js >> public/site.js
RUN node patch-ai-booking.mjs

ENV NODE_ENV=production
CMD ["npm", "start"]
