FROM node:24-alpine

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm ci --omit=dev

COPY app/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
