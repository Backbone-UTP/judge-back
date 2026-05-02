# judge-back

Backend base en Node.js + Express con estructura modular (estilo Nest), PostgreSQL y Docker Compose.

La descripcion funcional y la logica general del sistema estan en `CONSIDERACIONES.md`.

## Requisitos previos

Necesitas tener instalado:

1. Node.js (recomendado >= 20)
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

Archivo `.env` actual:

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

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
```

Notas de autenticacion:

- Este backend usa login solo con Google (sin correo/contrasena local).
- `GOOGLE_CLIENT_ID` debe ser el mismo client ID configurado en tu frontend.
- `JWT_SECRET` se usa para firmar el token propio del backend.

Notas de infraestructura local:

- `REDIS_PORT` expone Redis en tu maquina local.
- `BULLBOARD_PORT` expone la UI de Bull Board.

## Levantar el proyecto (paso a paso)

1) Instalar dependencias

```bash
npm install
```

2) Levantar infraestructura local (PostgreSQL + Redis + Bull Board)

```bash
docker compose up -d
```

Este comando levanta:

- PostgreSQL
- Redis
- Bull Board

3) Verificar que los contenedores estan arriba

```bash
docker ps
```

Deberias ver al menos estos contenedores:

- `judge-back-postgres`
- `judge-back-redis`
- `judge-back-bullboard`

4) Iniciar backend

```bash
npm run start:dev
```

5) Probar endpoint de salud

```bash
curl http://localhost:3000/health
```

Respuesta esperada (ejemplo):

```json
{
  "message": "OK",
  "databaseTime": "2026-04-18T12:00:00.000Z"
}
```

## Login con Google (solo Google)

Si aun no tienes frontend, puedes generar un `idToken` desde OAuth Playground y probar este endpoint con `curl`.

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

- La tabla `users` se crea automaticamente al arrancar la app.
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

Ver logs de contenedores:

```bash
docker compose logs -f
```

Abrir Bull Board en local:

```bash
http://localhost:7307
```

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
