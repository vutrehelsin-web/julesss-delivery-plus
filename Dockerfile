# Dockerfile oficial para Delivery Plus
# Multi-stage build optimizado para producción

# Etapa 1: Build de la aplicación
FROM node:22-slim AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Imagen de ejecución ligera
FROM node:22-slim
WORKDIR /app

# Copiar dependencias de producción únicamente
COPY package*.json ./
RUN npm install --only=production

# Copiar los archivos compilados de la etapa anterior
COPY --from=builder /app/dist ./dist

# Configurar variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar el servidor
CMD ["npm", "run", "start"]
