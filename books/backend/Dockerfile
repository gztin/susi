FROM node:20-slim

# 安裝 Chromium 及其依賴（puppeteer-core 需要）
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    python3 \
    make \
    g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server_simple.js"]
