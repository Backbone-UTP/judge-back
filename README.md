# judge-back

Backend base en Node.js + Express con estructura modular (estilo Nest), PostgreSQL y Docker Compose.

La descripcion funcional y la logica general del sistema estan en `CONSIDERACIONES.md`.

## Requisitos previos

Necesitas tener instalado:

1. Node.js `^20.19 || ^22.12 || >=24.0`
2. npm
3. Docker
4. Docker Compose

Validacion rapida:

```bash
node -v
npm -v
docker -v
docker compose version
```

## Estructura actual

```text
judge-back/
  .env
  .env.example
  docker-compose.yml
  package.json
  src/
    main.js
    app.module.js
    config/
      env.js
    database/
      postgres.js
    modules/
      auth/
        auth.module.js
        auth.controller.js
        auth.service.js
        auth.repository.js
        auth.middleware.js
      health/
        health.module.js
        health.controller.js
        health.service.js
```

## Configuracion de entorno

Crear el archivo local de entorno antes de instalar dependencias:

```bash
cp .env.example .env
```

Valores locales por defecto:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=judge_back

REDIS_HOST=localhost
REDIS_PORT=6378
BULLBOARD_PORT=7307
BULLMQ_HEALTH_QUEUE=health-check-queue

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com 
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

DATABASE_URL="postgresql://postgres:postgres@localhost:5434/judge_back?schema=public"
```

Notas de autenticacion:

- Este backend usa login solo con Google (sin correo/contraseña local).
- `GOOGLE_CLIENT_ID` debe ser el mismo client ID configurado en tu frontend, se crea desde la consola de Google Cloud **https://console.cloud.google.com/**.
- `JWT_SECRET` se usa para firmar el token propio del backend.
- `idToken` es el token que devuelve Google al hacer login, se valida en el backend usando el client ID, se puede acceder a el a través de **http://localhost:3000/auth/google/playground** (sí no hay frontend).

Notas de infraestructura local:

- `REDIS_PORT` expone Redis en tu maquina local.
- `BULLBOARD_PORT` expone la UI de Bull Board.
- `DATABASE_URL` es la unica conexion usada por la API, Prisma y las migraciones.
- `DB_*` solo configura el contenedor local de PostgreSQL. Si los cambias, ajusta `DATABASE_URL` para que apunte a la misma base.

## Levantar el proyecto (paso a paso)

1) Crear y configurar `.env`

```bash
cp .env.example .env
```

2) Instalar dependencias

```bash
npm install
```

3) Levantar infraestructura local (PostgreSQL + Redis + Bull Board)

```bash
docker compose up -d
```

Este comando levanta:

- PostgreSQL
- Redis
- Bull Board

4) Aplicar las migraciones de Prisma

```bash
npm run prisma:migrate:deploy
```

5) Verificar que los contenedores estan arriba

```bash
docker ps
```

Deberias ver al menos estos contenedores:

- `judge-back-postgres`
- `judge-back-redis`
- `judge-back-bullboard`

6) Iniciar backend

```bash
npm run start:dev
```

7) Probar endpoint de salud

```bash
curl http://localhost:3000/health
```

Respuesta esperada (ejemplo):

```json
{
  "message": "OK",
  "databaseTime": "2026-04-18T12:00:00.000Z",
  "bullmq": {
    "queue": "health-check-queue",
    "jobId": "1",
    "name": "health-check-job"
  }
}
```

Cada vez que llamas `GET /health`, el backend crea un job nuevo en BullMQ.
Luego lo puedes ver en Bull Board.

### Base de datos creada antes de Prisma

Si una base ya tiene las tablas `users` y `problems` creadas por una version anterior de la API, no ejecutes `prisma:migrate:deploy` primero: intentaria crear las tablas de nuevo.

1. Haz un respaldo y confirma que ambas tablas tienen las columnas, indices y el constraint de dificultad definidos en `prisma/migrations/0_init/migration.sql`.
2. Registra la migracion inicial como ya aplicada, sin modificar tablas ni datos:

```bash
npx prisma migrate resolve --applied 0_init
```

3. Ejecuta `npm run prisma:migrate:deploy` normalmente para las migraciones futuras.

## Login con Google (solo Google)

Si aun no tienes frontend, abre esta ruta en el navegador para sacar un `idToken` real:

```bash
http://localhost:3000/auth/google/playground
```

La pagina te muestra un boton de Google Login, guarda el token devuelto en pantalla y luego puedes probar el endpoint con `curl`.

Cuando ya tengas el token, mandalo asi:

```bash
curl -X POST http://localhost:3000/auth/google ^
  -H "Content-Type: application/json" ^
  -d "{\"idToken\":\"PEGAR_TOKEN_AQUI\"}"
```

En PowerShell, el mismo request queda asi:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/auth/google `
  -ContentType 'application/json' `
  -Body '{"idToken":"PEGAR_TOKEN_AQUI"}'
```

Endpoint de login:

```bash
POST /auth/google
```

Body esperado:

```json
{
  "idToken": "token_devuelto_por_google"
}
```

Respuesta exitosa (ejemplo):

```json
{
  "accessToken": "jwt_del_backend",
  "user": {
    "id": 1,
    "email": "estudiante@correo.com",
    "full_name": "Nombre Apellido",
    "avatar_url": "https://...",
    "created_at": "2026-04-18T12:00:00.000Z",
    "updated_at": "2026-04-18T12:00:00.000Z"
  }
}
```

Endpoint para usuario autenticado:

```bash
GET /auth/me
Authorization: Bearer <accessToken>
```

Importante:

- Las tablas se crean y actualizan exclusivamente mediante migraciones de Prisma.
- No existe login con password en este backend.
- El `idToken` debe tener como `aud` el mismo `GOOGLE_CLIENT_ID` que configuraste en `.env`.

## Comandos utiles

Arrancar API en modo desarrollo:

```bash
npm run start:dev
```

Arrancar API en modo normal:

```bash
npm start
```

Generar Prisma Client manualmente:

```bash
npm run prisma:generate
```

Aplicar migraciones pendientes:

```bash
npm run prisma:migrate:deploy
```

Ver logs de contenedores:

```bash
docker compose logs -f
```

Abrir Bull Board en local:

```bash
http://localhost:7307
```

Prueba rapida de BullMQ:

1. Ejecuta `curl http://localhost:3000/health` varias veces.
2. Abre Bull Board en `http://localhost:7307`.
3. Valida que existe actividad en la cola `health-check-queue`.

Detener infraestructura local:

```bash
docker compose down
```

## Problemas comunes

Puerto ocupado al levantar PostgreSQL:

- Cambia `DB_PORT` en `.env`.
- Vuelve a ejecutar `docker compose up -d`.

Error de conexion a DB:

- Verifica que el contenedor exista en `docker ps`.
- Revisa que `.env` coincida con `docker-compose.yml`.

## Siguiente paso recomendado

- Leer `CONSIDERACIONES.md` para entender la arquitectura completa (API + cola BullMQ + microservicio de ejecucion + veredictos).
