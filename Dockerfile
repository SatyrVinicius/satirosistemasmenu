FROM node:22-alpine AS build

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN npm install --include=dev --no-package-lock

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]