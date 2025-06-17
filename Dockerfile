# Usa la imagen oficial de Node.js 22
FROM node:22-slim AS development

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json (o yarn.lock)
# antes de instalar las dependencias para aprovechar el cache de Docker
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto en el que la aplicación NestJS estará escuchando
# Asegúrate de que este puerto coincida con el puerto configurado en tu aplicación NestJS (generalmente 3000)
EXPOSE 3000

ENV CHROMIUM_PATH="/usr/bin/chromium"

# Comando para iniciar la aplicación en modo desarrollo
# Puedes cambiar esto a 'npm run start:prod' para producción
CMD ["npm", "run", "start:dev"]
