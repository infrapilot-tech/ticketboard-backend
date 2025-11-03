FROM node:18-alpine

# Instalar curl para health checks y debugging
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Instalar prom-client si no está en package.json
RUN npm install prom-client

# Exponer puerto
EXPOSE 80
EXPOSE 3000
EXPOSE 3001

# Comando de inicio
CMD ["node", "index.js"]