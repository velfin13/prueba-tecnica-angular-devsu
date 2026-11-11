# Etapa 1: compila la aplicación. Nada de esta etapa llega a la imagen final.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Etapa 2: solo los archivos estáticos compilados servidos por nginx.
FROM nginx:1.29-alpine
ENV BACKEND_URL=http://host.docker.internal:3002
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 backend-fallback.envsh /docker-entrypoint.d/05-backend-fallback.envsh
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
