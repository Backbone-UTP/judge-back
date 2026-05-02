# Consideraciones del Proyecto

Este documento describe la logica general del sistema del juez de programacion y como se va a construir por etapas.

## Contexto

Somos un semillero de investigacion enfocado en desarrollo web.

Objetivo: construir una plataforma tipo HackerRank/Codeforces donde los estudiantes puedan enviar soluciones y recibir un veredicto automatico.

## Vision general de arquitectura

El sistema se divide en componentes separados para mantener claridad, escalabilidad y seguridad.

1. **Backend principal (este repositorio)**
2. **Cola de trabajos con BullMQ + Redis**
3. **Microservicio de ejecucion (otro repositorio)**
4. **Base de datos PostgreSQL**

## Rol de este repositorio (backend principal)

Este backend sera el orquestador de la plataforma.

Responsabilidades principales:

- Exponer API para el frontend.
- Gestionar autenticacion de usuarios con Google (sin password local).
- Recibir datos de usuarios, problemas, envios y resultados.
- Crear jobs en la cola cuando llegue un envio de codigo.
- Consultar/actualizar estado de cada envio.
- Guardar veredictos finales en la base de datos.
- Informar al frontend lo que esta pasando (pendiente, ejecutando, aceptado, rechazado, etc.).

## BullMQ + Redis (cola de procesamiento)

La cola sirve para desacoplar el backend del proceso de ejecucion de codigo.

Flujo de cola:

1. Llega envio de codigo al backend.
2. El backend crea un job en BullMQ.
3. El job queda en estado `waiting`/`queued`.
4. Un worker (microservicio externo) toma el job y lo procesa.

Ventajas de hacerlo con cola:

- Evitar bloquear requests HTTP largos.
- Permitir reintentos controlados.
- Escalar workers independientemente del backend.
- Tener trazabilidad de estados y tiempos.

## Microservicio de ejecucion (repositorio separado)

Este servicio consumira jobs desde BullMQ y ejecutara el codigo en ambiente controlado.

Responsabilidades:

- Preparar entorno seguro de ejecucion.
- Compilar (si aplica) y ejecutar el codigo enviado.
- Correr contra casos de prueba.
- Controlar limites: tiempo, memoria, salida, errores.
- Emitir veredicto final y metrica de ejecucion.
- Reportar resultado al backend principal (o escribir en DB segun la estrategia definida).

## Seguridad (principio clave)

La ejecucion de codigo del usuario **no** debe ocurrir en el backend principal.

Debe ejecutarse aislada:

- En contenedor/ambiente sandbox.
- Con limites de CPU, memoria y tiempo.
- Sin acceso libre a red/host.
- Sin privilegios elevados.

Esto reduce riesgo de ejecucion maliciosa o fuga de datos.

## Flujo funcional completo (alto nivel)

1. Usuario envia solucion desde frontend.
2. Frontend llama API del backend principal.
3. Backend valida payload y crea registro inicial en DB (`submission`).
4. Backend crea job en BullMQ con metadata necesaria.
5. Worker toma el job y ejecuta la solucion en sandbox.
6. Worker calcula veredicto (AC, WA, TLE, RE, CE, etc.).
7. Resultado se persiste en DB.
8. Backend expone el estado/veredicto al frontend.

## Veredictos esperados

Lista inicial sugerida:

- `AC` (Accepted)
- `WA` (Wrong Answer)
- `TLE` (Time Limit Exceeded)
- `MLE` (Memory Limit Exceeded)
- `RE` (Runtime Error)
- `CE` (Compilation Error)
- `PE` (Presentation Error, opcional)

## Estados sugeridos para envios

Estados de ciclo de vida en DB:

- `queued`
- `running`
- `finished`
- `failed`

`finished` tendra un `verdict` asociado.

## Modelo de datos base (borrador)

Entidades minimas que normalmente necesitaremos:

- `users`
- `problems`
- `test_cases`
- `submissions`
- `submission_results` (opcional si se separa detalle)

Nota de autenticacion:

- En la entidad `users` se guardara `google_sub` como identificador unico del usuario en Google.
- El backend emitira su propio JWT de sesion para proteger endpoints internos.

Campos comunes en `submissions`:

- `id`
- `user_id`
- `problem_id`
- `language`
- `source_code`
- `status`
- `verdict`
- `execution_time_ms`
- `memory_kb`
- `created_at`
- `updated_at`

## Convenciones de implementacion en este backend

Para mantener orden tipo Nest en Express:

- Cada dominio en `src/modules/<dominio>/`
- Separar en `*.controller.js`, `*.service.js`, `*.module.js`
- Registrar modulos en `src/app.module.js`
- Mantener acceso a DB centralizado en `src/database/`

## Plan por fases (propuesto)

Fase 1 - Base del backend:

- Estructura modular.
- Configuracion de entorno.
- Conexion a PostgreSQL.
- Endpoint de health.

Fase 2 - Dominio academico:

- CRUD basico de problemas.
- CRUD de test cases.
- Endpoints de envios (`submissions`).

Fase 3 - Integracion de cola:

- Redis + BullMQ.
- Crear jobs de evaluacion.
- Endpoint para consultar estado del job/envio.

Fase 4 - Integracion con microservicio de ejecucion:

- Contrato de payload entre backend y worker.
- Persistencia de veredictos.
- Manejo de errores y reintentos.

Fase 5 - Observabilidad y robustez:

- Logs estructurados.
- Trazabilidad por submission/job.
- Validaciones y manejo de errores estandar.

## Decision de separacion en repositorios

Mantener backend y ejecutor en repos separados aporta:

- Mejor aislamiento de seguridad.
- Despliegue independiente por componente.
- Escalado independiente.
- Menor acoplamiento tecnico.

## Nota final

Este documento es una guia viva: se puede ajustar conforme avancemos en el diseno del dominio, el contrato de mensajes de la cola y las politicas de seguridad del entorno de ejecucion.
