# Imagen del backend de la prueba (proyecto aparte, no incluido en este repositorio).
# Uso, desde la carpeta del backend descomprimido:
#   docker build -f RUTA/docker/backend.Dockerfile -t velfin13/prueba-tecnica-backend-devsu .

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
# El script de build del proyecto (tsc) no compila con las dependencias actuales,
# así que se arranca igual que start:dev pero sin el modo watch.
RUN npm ci --include=dev --no-audit --no-fund && npm cache clean --force
COPY tsconfig.json ./
COPY src ./src
USER node
EXPOSE 3002
CMD ["node_modules/.bin/tsnd", "--transpile-only", "./src/main.ts"]
