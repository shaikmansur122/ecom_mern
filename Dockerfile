# Single-container image for hosting (Render, etc.): the API also serves the React build.
# Local development uses docker-compose.yml, which runs client/ and server/ as separate images.
FROM node:22-alpine AS client
WORKDIR /client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PUBLIC_DIR=/app/public
COPY server/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server/src ./src
COPY --from=client /client/dist ./public
USER node
EXPOSE 5000
CMD ["node", "src/index.js"]
