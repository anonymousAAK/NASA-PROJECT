FROM node:lts-alpine AS base

WORKDIR /app

# Install root dependencies
COPY package*.json ./

# Install client dependencies
COPY client/package*.json client/
RUN npm run install-client --omit=dev

# Install server dependencies
COPY server/package*.json server/
RUN npm run install-server --omit=dev

# Build the client
FROM base AS build
COPY client/ client/
RUN npm run build --prefix client

# Production image
FROM node:lts-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/server/node_modules server/node_modules
COPY --from=base /app/node_modules node_modules
COPY --from=base /app/package*.json ./
COPY --from=build /app/server/public server/public
COPY server/package*.json server/
COPY server/src server/src
COPY server/data server/data

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/v1/health || exit 1

CMD [ "npm", "start", "--prefix", "server" ]
