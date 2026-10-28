# TW2-Market: contexto para agentes de IA

Este archivo es el punto de entrada para cualquier agente de IA que trabaje en el repositorio. Describe el objetivo del proyecto, las reglas transversales y el **estado actual de cada funcionalidad**. Es un documento vivo: **el agente que modifique el repositorio debe actualizarlo antes de terminar su tarea** (ver [Mantenimiento de este archivo](#mantenimiento-de-este-archivo)).

## Directivas por plataforma (obligatorio)

Antes de escribir código, cargar en contexto el AGENTS.md de la plataforma correspondiente y respetar sus directivas:

- **Frontend** (cualquier cambio en `client/`): leer [`client/AGENTS.md`](client/AGENTS.md) (Angular 22).
- **Backend** (cualquier cambio en `server/`): leer [`server/AGENTS.md`](server/AGENTS.md) (NestJS 12).
- **Cambios que tocan ambas plataformas** (por ejemplo, un endpoint nuevo y la pantalla que lo consume): leer ambos.

Si una directiva de plataforma entra en conflicto con este archivo, prevalece la regla más específica (la de la plataforma), salvo las reglas de arquitectura y seguridad de este documento, que no deben relajarse.

## Objetivo del proyecto

Trabajo práctico de taller: una aplicación web de comercio electrónico con gestión de usuarios y de productos. Grupo de 7 alumnos. Repositorio de ejemplo de la cátedra: https://github.com/llarreta/taller

### Requisitos del enunciado

| Área | Funcionalidad | Obligatoriedad |
| --- | --- | --- |
| Usuarios | Signup (registro) | Requerido |
| Usuarios | Signin (inicio de sesión) | Requerido |
| Usuarios | Recupero de contraseña | Opcional |
| Productos | Visualización de productos | Requerido |
| Productos | Agregar producto al carrito de compras | Requerido |
| Productos | Ver pedido (detalle del carrito) | Requerido |
| Productos | Carga de nuevo producto | Opcional |

Reglas de negocio explícitas:

- **Usuario**, datos mínimos: email, contraseña, nombre, apellido, dirección.
- Se debe **validar la complejidad de la contraseña** (en frontend y, obligatoriamente, en backend).
- **El email es único**: no se puede registrar más de un usuario con el mismo email (validar en el servicio y reforzar con una restricción única en la base de datos).
- **Producto**, datos mínimos: nombre, descripción, clasificación, precio.
- Desde la visualización de un producto se puede agregarlo al carrito.
- La vista del carrito muestra el detalle de los productos del pedido a realizar.

### Requisitos implícitos (asumidos por el equipo)

- **Autenticación con JWT**: registro e inicio de sesión con email y contraseña; el backend emite un token JWT y las rutas protegidas lo exigen mediante un guard. Las contraseñas se guardan hasheadas (argon2 o bcrypt), nunca en texto plano ni en respuestas.
- **Validación y sanitización** de todos los datos que viajan entre frontend y backend: el frontend valida para dar feedback al usuario, pero **el backend es la fuente de verdad** y valida y sanitiza toda entrada (body, params, query, headers).
- **Separación estricta de capas en backend**:
  - **Controller**: sin lógica. Recibe la request ya validada, llama al servicio y devuelve su resultado.
  - **Service**: contiene toda la lógica de negocio. Accede a datos solo a través de repositorios.
  - **Repository**: única capa que habla con la base de datos.
  - Un controller nunca accede a un repositorio ni a la base de datos directamente.
- Las respuestas de la API nunca exponen campos sensibles o internos (por ejemplo, el hash de la contraseña).

## Stack y estructura

```
/
├── AGENTS.md          ← este archivo
├── Dockerfile         ← build multi-etapa: compila client/ y lo copia a /app/public del server
├── .dockerignore      ← excluye node_modules, .env, builds locales, bases SQLite y .git del contexto de build
├── .github/workflows/ci.yml ← CI: tests y build de client/ y server/ en cada pull request (y push a main)
├── client/            ← Angular 22 (standalone, signals, Vitest). Directivas: client/AGENTS.md
└── server/            ← NestJS 12 sobre Express 5, ESM, Vitest, oxlint. Directivas: server/AGENTS.md
    ├── .env.example   ← variables de entorno (validadas con Joi en src/config/env.validation.ts)
    └── src/
        ├── config/    ← esquema Joi del entorno y opciones de ConfigModule
        ├── db/        ← opciones de TypeORM, datasource del CLI y migrations/
        ├── entities/  ← entidades TypeORM (*.entity.ts)
        ├── common/    ← piezas transversales: @Public(), JwtAuthGuard, JwtStrategy
        └── modules/   ← (convención) un directorio por feature: users, auth, products, cart, ...
```

- Node 24 (según el `Dockerfile`).
- UI del cliente: Angular Material (+ CDK), tema M3 en `client/src/styles.scss` (agregado con `ng add`; fuentes Roboto y Material Symbols desde Google Fonts en `index.html`), y Bootstrap 5 (CSS y `bootstrap.bundle` con Popper, cargados desde `angular.json`; el CSS de Bootstrap va antes de `styles.scss`).
- Comandos frontend (desde `client/`): `npm start`, `npm run build`, `npm test`.
- Comandos backend (desde `server/`): `npm run start:dev`, `npm run build`, `npm test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npm run migration:generate | migration:create | migration:run | migration:revert | migration:show`.

## Estado actual

> Leyenda: ⬜ No iniciado · 🟨 En progreso / incompleto · 🟪 Mockeado · ✅ Completo

### Funcionalidades

| Funcionalidad | Backend | Frontend | Notas |
| --- | --- | --- | --- |
| Signup | ⬜ | ⬜ | Requiere validar complejidad de contraseña y email único. |
| Signin (JWT) | ⬜ | ⬜ | La infraestructura JWT ya existe (ver tabla siguiente); falta el endpoint que emite el token e interceptor HTTP en el cliente. |
| Recupero de contraseña (opcional) | ⬜ | ⬜ | Sin definir el mecanismo (token por email, etc.). |
| Visualización de productos | ⬜ | ⬜ | Listado (paginado) y detalle. |
| Agregar producto al carrito | ⬜ | ⬜ | Disponible desde la vista del producto. |
| Ver pedido / carrito | ⬜ | ⬜ | Detalle de los productos del pedido. |
| Carga de nuevo producto (opcional) | ⬜ | ⬜ | Definir quién puede cargar productos (¿rol admin?). |

### Infraestructura y piezas transversales

| Pieza | Estado | Notas |
| --- | --- | --- |
| Proyecto Angular | 🟨 | Generado con el CLI: `app.routes.ts` vacío y `app.html` con la plantilla por defecto de Angular. Angular Material y Bootstrap instalados y configurados (sin usarse aún). Sin componentes ni servicios propios. |
| Proyecto NestJS | ✅ | Arquitectura global configurada (config, TypeORM, JWT, serve-static, prefijo `/api`, security headers). Se quitaron `AppController` / `AppService` de ejemplo. Sin módulos de feature. |
| Base de datos y ORM | ✅ | TypeORM 1.x + SQLite (`better-sqlite3`), archivo en `DB_PATH` (por defecto `server/data/tw2market.sqlite`; en Docker `/app/data`, que conviene montar como volumen para no perder datos). Migraciones en `src/db/migrations/` (se ejecutan al iniciar si `DB_MIGRATIONS_RUN=true`). Sin entidades ni migraciones todavía. |
| Configuración por entorno | ✅ | `@nestjs/config` global + Joi. La app no arranca si falta una variable requerida (hoy solo `JWT_SECRET`). Plantilla en `server/.env.example`. |
| Validación global (backend) | ⬜ | No hay pipe de validación global registrado. |
| Autenticación (JWT, guards) | ✅ | `@nestjs/jwt` global, `JwtStrategy` (passport-jwt, Bearer) y `JwtAuthGuard` como `APP_GUARD`: **toda ruta exige JWT salvo las marcadas con `@Public()`**. `JwtStrategy.validate` devuelve el payload tal cual; el feature de auth debe tiparlo. |
| Comunicación client ↔ server | 🟨 | Backend: prefijo global `/api`, sin CORS (mismo origen en producción). Cliente: falta `provideHttpClient` y proxy de desarrollo hacia `/api`. |
| Servir el frontend desde el backend | 🟨 | `@nestjs/serve-static` sirve `server/public` (= `/app/public` en Docker) con fallback a `index.html`; `/api/*` queda excluido (404 JSON). La ruta del `Dockerfile` es correcta. El `.dockerignore` de la raíz excluye `node_modules`, `.env`, builds locales, bases SQLite y `.git` del contexto. La CSP de `useSecurityHeaders()` puede requerir ajustes cuando exista el frontend real (por ejemplo, para permitir Google Fonts, que usa el tema de Material). |
| Tests | 🟨 | Backend: unit del esquema de entorno y e2e del guard JWT / exclusión de `/api` (SQLite en memoria, no requiere configurar una DB). Frontend: solo los tests de ejemplo del CLI. |
| Control de versiones | ✅ | Rama `main` con el commit inicial de scaffolding. |
| CI (GitHub Actions) | 🟨 | `.github/workflows/ci.yml`: en cada PR (y push a `main`) corre, en jobs paralelos con Node 24, `npm ci` + tests + build del cliente, y `npm ci` + lint + tests unit + e2e + build del servidor. Los comandos se verificaron localmente; falta confirmar la primera ejecución en GitHub. |

### Mocks activos

Lista de todo lo que hoy está simulado y debe reemplazarse por una implementación real. Incluir ubicación (archivo) y qué falta para reemplazarlo.

- _(ninguno por el momento)_

### Decisiones pendientes

- Persistencia del carrito: en el servidor, asociado al usuario (recomendado), o solo en el cliente.
- Política exacta de complejidad de contraseña (largo mínimo, mayúsculas, números, símbolos). Debe ser la misma en frontend y backend.
- Roles: si la carga de productos queda restringida a un administrador.
- Mecanismo de recupero de contraseña (si se implementa).

### Decisiones tomadas

- Features del backend en `server/src/modules/<feature>/` (ver `server/AGENTS.md`).
- Autenticación con JWT; contraseñas hasheadas.
- Capas estrictas en backend: controller → service → repository.
- Base de datos: SQLite (`better-sqlite3`) con TypeORM y migraciones (sin `synchronize` por defecto): no requiere un servidor de base de datos, lo que simplifica el desarrollo y el despliegue del TP.
- Autenticación con Passport (`passport-jwt`) y guard global con opt-out mediante `@Public()`.
- UI del cliente con Angular Material (componentes) y Bootstrap (grilla y utilidades de layout).

## Mantenimiento de este archivo

**Todo agente de IA que modifique el repositorio debe actualizar este archivo en la misma tarea**, antes de darla por terminada:

1. Actualizar los estados de las tablas de [Estado actual](#estado-actual) que hayan cambiado, en la columna correspondiente (backend o frontend).
2. Marcar como 🟨 lo que quede incompleto y explicar en "Notas" qué falta concretamente.
3. Registrar en [Mocks activos](#mocks-activos) todo dato, servicio o endpoint simulado que se agregue (con archivo y motivo), y quitarlo de la lista cuando se reemplace por la implementación real.
4. Mover a "Decisiones tomadas" las decisiones que se resuelvan, con una línea de justificación.
5. Si cambian comandos, estructura de carpetas o dependencias relevantes, actualizar [Stack y estructura](#stack-y-estructura).

Reglas:

- Reflejar solo lo que existe en el código. No marcar como ✅ algo sin verificar (compila, pasa lint y tests).
- Mantener el archivo conciso: el detalle de implementación va en el código y en los AGENTS.md de cada plataforma, no aquí.
