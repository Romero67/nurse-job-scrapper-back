# 🏥 Nurse Job Scrapper

Un scrapper de trabajos de enfermería construido con NestJS, MongoDB y Docker. Esta aplicación extrae ofertas de trabajo para enfermeras/os una web y proporciona una API REST para consultar y filtrar los resultados.

## 🚀 Características

- **Web Scrapping**: Extrae automáticamente ofertas de trabajo de enfermería
- **API REST**: Endpoints para consultar y filtrar trabajos
- **Filtros Avanzados**: Búsqueda por título, empresa y ubicación
- **Paginación**: Resultados paginados para mejor rendimiento
- **Ordenamiento**: Múltiples opciones de ordenamiento
- **Documentación Swagger**: API documentada automáticamente
- **Base de Datos**: Persistencia con MongoDB
- **Dockerizado**: Fácil despliegue con Docker

## 🛠️ Tecnologías

- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Puppeteer** - Web scrapping
- **Swagger** - Documentación de API
- **Docker** - Contenedorización
- **TypeScript** - Lenguaje de programación

## 📋 Prerrequisitos

- Docker
- Docker Compose

## 🚀 Instalación y Ejecución

### Usando Docker (Recomendado)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd nurse-job-scrapper
   ```

2. **Crear archivo de variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus configuraciones.

3. **Construir y ejecutar con Docker Compose**
   ```bash
   docker compose up --build
   ```

4. **¡Listo!** 🎉
   - API: http://localhost:3000
   - Swagger UI: http://localhost:3000/api
   - MongoDB: localhost:27017

### Desarrollo Local

Si prefieres ejecutar sin Docker:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar en modo producción
npm run start:prod
```

## 🔗 API Endpoints

### Trabajos

#### `GET /job` - Obtener trabajos con filtros opcionales

**Query Parameters:**
- `title` (opcional): Filtrar por título del trabajo
- `company` (opcional): Filtrar por nombre de la empresa
- `location` (opcional): Filtrar por ubicación (calle, ciudad, región, país)
- `sort` (opcional): Ordenar por:
  - `title` / `title_desc`: Por título
  - `date` / `date_asc`: Por fecha de publicación
  - `salary` / `salary_asc`: Por salario
  - `company`: Por empresa
  - `location`: Por ubicación
- `skip` (opcional): Número de registros a omitir (paginación)
- `limit` (opcional): Número de registros a devolver (máx. 100)

**Ejemplos:**
```bash
# Obtener todos los trabajos
GET /job

# Buscar trabajos de enfermería pediátrica
GET /job?title=pediatric

# Buscar trabajos en Madrid
GET /job?location=madrid

# Buscar trabajos en hospitales ordenados por salario
GET /job?company=hospital&sort=salary

# Búsqueda combinada con paginación
GET /job?title=nurse&location=barcelona&sort=date&skip=0&limit=20
```

**Respuesta:**
```json
{
  "data": [
    {
      "_id": "...",
      "title": "Registered Nurse - Pediatrics",
      "description": "...",
      "organization": {
        "name": "General Hospital",
        "url": "..."
      },
      "location": {
        "street": "123 Main St",
        "locality": "Madrid",
        "region": "Madrid",
        "country": "Spain"
      },
      "salary": {
        "currency": "EUR",
        "amount": 35000,
        "unit": "YEAR"
      },
      "datePosted": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 20,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Scrapper

#### `GET /scrapper/last-update` - Obtener fecha de última actualización

**Respuesta:**
```json
{
  "date": "2024-01-15T10:30:00Z"
}
```

## 📊 Documentación de la API

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

**http://localhost:3000/api**

## 🗃️ Estructura del Proyecto

```
nurse-job-scrapper/
├── src/
│   ├── config/          # Configuraciones
│   ├── job/             # Módulo de trabajos
│   │   ├── schemas/     # Esquemas de MongoDB
│   │   ├── job.controller.ts
│   │   ├── job.service.ts
│   │   └── job.module.ts
│   ├── scrapper/        # Módulo del scrapper
│   │   ├── scrapper.controller.ts
│   │   ├── scrapper.service.ts
│   │   └── scrapper.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml   # Configuración de Docker Compose
├── Dockerfile          # Imagen de Docker
└── README.md
```

## ⚙️ Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# Base de datos
MONGODB_URI=mongodb://mongodb:27017/nurse-jobs

# Servidor
PORT=3000
NODE_ENV=development

# Scrapper configuración
SCRAPPER_INTERVAL=3600000  # 1 hora en milisegundos
CHROMIUM_PATH=/usr/bin/chromium
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## 🚀 Despliegue en Producción

### Con Docker Compose

1. **Configurar variables de entorno para producción**
2. **Usar imagen de producción:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Comandos Útiles

```bash
# Ver logs
docker-compose logs -f nurse-scrapper

# Reiniciar servicios
docker-compose restart

# Parar servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes algún problema o pregunta:

1. Revisa la documentación de Swagger en `/api`
2. Verifica los logs con `docker compose logs -f`
3. Abre un issue en el repositorio

---

**Desarrollado Como prueba técnica para mostrar mis habilidades**
