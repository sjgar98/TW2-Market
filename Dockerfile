FROM node:24-alpine AS build

WORKDIR /app
COPY ./client/package*.json ./
RUN npm ci
COPY ./client .
RUN npm run build

FROM node:24-alpine

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY ./server/package*.json ./
USER node
RUN npm ci
COPY --chown=node:node ./server .
RUN npm run build
COPY ./server .
COPY --from=build /app/dist/tw2-market/browser /app/public

EXPOSE 3000

CMD ["node", "dist/main"]
