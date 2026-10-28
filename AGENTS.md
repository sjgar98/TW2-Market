# TW2-Market: contexto para agentes de IA

Este archivo es el punto de entrada para cualquier agente de IA que trabaje en el repositorio. Describe el objetivo del proyecto, las reglas transversales y el **estado actual de cada funcionalidad**. Es un documento vivo: **el agente que modifique el repositorio debe actualizarlo antes de terminar su tarea** (ver [Mantenimiento de este archivo](#mantenimiento-de-este-archivo)).

## Directivas por plataforma (obligatorio)

Antes de escribir código, cargar en contexto el AGENTS.md de la plataforma correspondiente y respetar sus directivas:

- **Frontend** (cualquier cambio en `client/`): leer [`client/AGENTS.md`](client/AGENTS.md) (Angular 22).
- **Backend** (cualquier cambio en `server/`): leer [`server/AGENTS.md`](server/AGENTS.md) (NestJS 12).
- **Cambios que tocan ambas plataformas** (por ejemplo, un endpoint nuevo y la pantalla que lo consume): leer ambos.

Si una directiva de plataforma entra en conflicto con este archivo, prevalece la regla más específica (la de la plataforma), salvo las reglas de arquitectura y seguridad de este documento, que no deben relajarse.

## Objetivo del proyecto

Trabajo práctico de taller: una aplicación web de comercio electrónico con gestión de usuarios y de productos. Grupo de 4 alumnos. Repositorio de ejemplo de la cátedra: https://github.com/llarreta/taller

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
├── client/            ← Angular 22 (standalone, signals, Vitest). Directivas: client/AGENTS.md
└── server/            ← NestJS 12 sobre Express 5, ESM, Vitest, oxlint. Directivas: server/AGENTS.md
    └── src/modules/   ← (convención) un directorio por feature: users, auth, products, cart, ...
```

- Node 24 (según el `Dockerfile`).
- Comandos frontend (desde `client/`): `npm start`, `npm run build`, `npm test`.
- Comandos backend (desde `server/`): `npm run start:dev`, `npm run build`, `npm test`, `npm run test:e2e`, `npm run lint`, `npm run format`.

## Estado actual

> Leyenda: ⬜ No iniciado · 🟨 En progreso / incompleto · 🟪 Mockeado · ✅ Completo

### Funcionalidades

| Funcionalidad | Backend | Frontend | Notas |
| --- | --- | --- | --- |
| Signup | ⬜ | ⬜ | Requiere validar complejidad de contraseña y email único. |
| Signin (JWT) | ⬜ | ⬜ | Emisión de JWT, guard de rutas protegidas e interceptor HTTP en el cliente. |
| Recupero de contraseña (opcional) | ⬜ | ⬜ | Sin definir el mecanismo (token por email, etc.). |
| Visualización de productos | ⬜ | ⬜ | Listado (paginado) y detalle. |
| Agregar producto al carrito | ⬜ | ⬜ | Disponible desde la vista del producto. |
| Ver pedido / carrito | ⬜ | ⬜ | Detalle de los productos del pedido. |
| Carga de nuevo producto (opcional) | ⬜ | ⬜ | Definir quién puede cargar productos (¿rol admin?). |

### Infraestructura y piezas transversales

| Pieza | Estado | Notas |
| --- | --- | --- |
| Proyecto Angular | 🟨 | Recién generado con el CLI: `app.routes.ts` vacío y `app.html` con la plantilla por defecto de Angular. Sin componentes, servicios ni estilos propios. |
| Proyecto NestJS | 🟨 | Recién generado con el CLI: solo `AppController` / `AppService` de ejemplo ("Hello World!"). Sin módulos de feature. |
| Base de datos y ORM | ⬜ | **Sin decidir.** No hay motor de base de datos ni ORM instalado. |
| Configuración por entorno | ⬜ | No hay `@nestjs/config` ni archivos `.env`. El puerto se lee de `process.env.PORT` (por defecto 3000). |
| Validación global (backend) | ⬜ | No hay pipe de validación global registrado. |
| Autenticación (JWT, guards) | ⬜ | No hay dependencias de JWT instaladas. |
| Comunicación client ↔ server | ⬜ | El cliente no tiene `provideHttpClient`, ni proxy de desarrollo, ni prefijo `/api` definido. |
| Servir el frontend desde el backend | 🟨 | El `Dockerfile` copia el build del cliente a `/app/public`, pero el servidor no sirve archivos estáticos. Además, Angular genera el build en `dist/tw2-market/browser`, por lo que la ruta copiada probablemente quede anidada. Revisar al implementar. |
| Tests | 🟨 | Solo existen los tests de ejemplo generados por los CLIs. |
| Control de versiones | ⬜ | La rama `main` no tiene commits todavía. |

### Mocks activos

Lista de todo lo que hoy está simulado y debe reemplazarse por una implementación real. Incluir ubicación (archivo) y qué falta para reemplazarlo.

- _(ninguno por el momento)_

### Decisiones pendientes

- Motor de base de datos y ORM / librería de acceso a datos.
- Persistencia del carrito: en el servidor, asociado al usuario (recomendado), o solo en el cliente.
- Política exacta de complejidad de contraseña (largo mínimo, mayúsculas, números, símbolos). Debe ser la misma en frontend y backend.
- Roles: si la carga de productos queda restringida a un administrador.
- Mecanismo de recupero de contraseña (si se implementa).

### Decisiones tomadas

- Features del backend en `server/src/modules/<feature>/` (ver `server/AGENTS.md`).
- Autenticación con JWT; contraseñas hasheadas.
- Capas estrictas en backend: controller → service → repository.

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
