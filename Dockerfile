FROM node:20.19-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine-slim

COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY .docker/entrypoint.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80

ENTRYPOINT [ "/docker-entrypoint.d/env.sh" ]
CMD ["nginx", "-g", "daemon off;"]