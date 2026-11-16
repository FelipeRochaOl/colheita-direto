# Build a partir da raiz do monorepo: docker build -f apps/api/Dockerfile .
# A mesma imagem roda a API (CMD padrão) e o worker (command: node dist/worker.js).
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm turbo build --filter=@colheita/api... \
 && pnpm --filter=@colheita/api deploy --prod /deploy

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /deploy .
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
