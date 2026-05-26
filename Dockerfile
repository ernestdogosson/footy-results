# stage 1: build the React frontend bundle
# uses slim (glibc) so rollup's optional native dep in package-lock.json
# resolves (alpine/musl would mismatch and break vite build)
FROM node:24-slim AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci
COPY frontend ./frontend
RUN npm run build --workspace=frontend

# stage 2: backend runtime, also serves the built frontend
FROM node:24-alpine
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev
COPY backend/src ./src
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
EXPOSE 3000
CMD ["node", "src/server.js"]
