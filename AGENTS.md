# TW2-Market: contexto para agentes de IA

Este archivo es el punto de entrada para cualquier agente de IA que trabaje en el repositorio. Describe el objetivo del proyecto, las reglas transversales y el **estado actual de cada funcionalidad**. Es un documento vivo: **el agente que modifique el repositorio debe actualizarlo antes de terminar su tarea** (ver [Mantenimiento de este archivo](#mantenimiento-de-este-archivo)).

## Idioma (obligatorio)

Todas las respuestas de los agentes al usuario deben ser en español: mensajes, resúmenes, preguntas, explicaciones y planes.

## Directivas por plataforma (obligatorio)

Antes de escribir código, cargar en contexto el AGENTS.md de la plataforma correspondiente y respetar sus directivas:

- **Frontend** (cualquier cambio en `client/`): leer [`client/AGENTS.md`](client/AGENTS.md) (Angular 22).
- **Backend** (cualquier cambio en `server/`): leer [`server/AGENTS.md`](server/AGENTS.md) (NestJS 12).
- **Cambios que tocan ambas plataformas** (por ejemplo, un endpoint nuevo y la pantalla que lo consume): leer ambos.

Si una directiva de plataforma entra en conflicto con este archivo, prevalece la regla más específica (la de la plataforma), salvo las reglas de arquitectura y seguridad de este documento, que no deben relajarse.

## Objetivo del proyecto

Trabajo práctico de taller: una aplicación web de comercio electrónico con gestión de usuarios y de productos. Grupo de 7 alumnos. Repositorio de ejemplo de la cátedra: https://github.com/llarreta/taller

Rubro elegido: venta de celulares.

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
- Ficha de producto completa, pensada como si el TP fuera a presentarse a un cliente real: imagen, marca, especificaciones técnicas (pantalla, almacenamiento, RAM, batería, cámara) además de los datos mínimos del enunciado.

## Stack y estructura

/
├── AGENTS.md ← este archivo
├── docs/ ← ENUNCIADO.md (transcripción del PDF) y PROTOTIPOS.md (pantallas, flujos y reglas de UX, imágenes en prototipos/)
├── Dockerfile ← build multi-etapa: compila client/ y lo copia a /app/public del server
├── .dockerignore ← excluye node_modules, .env, builds locales, bases SQLite y .git del contexto de build
├── .github/workflows/ci.yml ← CI: tests y build de client/ y server/ en cada pull request (y push a main)
├── client/ ← Angular 22 (standalone, signals, Vitest). Directivas: client/AGENTS.md
└── server/ ← NestJS 12 sobre Express 5, ESM, Vitest, oxlint. Directivas: server/AGENTS.md
├── .env.example ← variables de entorno (validadas con Joi en src/config/env.validation.ts)
└── src/
├── config/ ← esquema Joi del entorno y opciones de ConfigModule
├── db/ ← opciones de TypeORM, datasource del CLI y migrations/
├── entities/ ← entidades TypeORM (*.entity.ts): Usuario, Producto
├── common/ ← piezas transversales: decoradores @Public() y @UsuarioActual()
└── modules/ ← un directorio por feature: auth (controller, service, guards, strategies), usuarios, productos, ...


- Node 24 (según el `Dockerfile`).
- UI del cliente: Angular Material (+ CDK), tema M3 en `client/src/styles.scss` (agregado con `ng add`; fuentes Roboto y Material Symbols desde Google Fonts en `index.html`), y Bootstrap 5 (CSS y `bootstrap.bundle` con Popper, cargados desde `angular.json`; el CSS de Bootstrap va antes de `styles.scss`).
- Comandos frontend (desde `client/`): `npm start` (requiere el backend en el puerto 3000 para `/api`), `npm run build`, `npm test`.
- Comandos backend (desde `server/`): `npm run start:dev`, `npm run build`, `npm test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npm run migration:generate | migration:create | migration:run | migration:revert | migration:show`.

## Estado actual

> Leyenda: ⬜ No iniciado · 🟨 En progreso / incompleto · 🟪 Mockeado · ✅ Completo

### Funcionalidades

| Funcionalidad | Backend | Frontend | Notas |
| --- | --- | --- | --- |
| Signup | ✅ | ✅ | `POST /api/auth/signup` → 201 con el usuario (sin hash); 400 si no cumple la política de contraseña, 409 si el email existe (validado en el servicio y con `UNIQUE` en la base). Crea usuarios con `isAdmin = false`. Pantalla `/registro`: Signal Form con checklist en vivo de la política (`core/auth/politica-password.ts`), error en el campo email ante 409 y redirección a `/ingresar?cuentaCreada=1`. |
| Signin (JWT) | ✅ | ✅ | `POST /api/auth/signin` (`passport-local`, campo `email`) → `{ accessToken }` (payload: `sub`, `email`, `nombre`, `apellido`, `isAdmin`); 401 si las credenciales son inválidas. Pantalla `/ingresar` con avisos por query param (`cuentaCreada`, `motivo=carrito`) y `returnUrl` (solo rutas internas). `Sesion` (`core/auth/sesion.ts`) guarda el token en `localStorage`; `authInterceptor` agrega el Bearer y ante un 401 cierra la sesión y redirige a `/ingresar?returnUrl=...`. `soloInvitadosGuard` saca de `/ingresar` y `/registro` a quien ya tiene sesión. |
| ~~Recupero de contraseña (opcional)~~ | — | — | **Descartado**, no se implementa (ver Decisiones tomadas). No debe existir link, ruta ni endpoint. |
| Visualización de productos | ✅ | ✅ | `GET /api/productos` (público, paginado: `pagina`, `limite`, `busqueda` por query param) → `{ items, total, pagina, limite }`; `GET /api/productos/:id` (público). Entidad `Producto` con nombre, marca, descripción, clasificación, precio, stock, imagen y especificaciones técnicas (pantalla, almacenamiento, RAM, batería, cámara). Frontend: landing (`features/productos/productos-listado/`) con buscador, chips de filtro por clasificación y grilla de tarjetas (imagen, specs resumidas, badge "Sin stock"); detalle (`features/productos/producto-detalle/`) con imagen, specs técnicas completas y botones de "Agregar al carrito" / "Comprar ahora" deshabilitados (fuera de alcance de esta tarea). Rutas lazy en `features/productos/productos.routes.ts`, montadas en `app.routes.ts` vía `loadChildren`. |
| Agregar producto al carrito | ⬜ | ⬜ | Disponible desde la vista del producto. Requiere sesión y respeta el stock. |
| Ver pedido / carrito | ⬜ | ⬜ | Detalle de los productos del pedido, confirmación (pago simulado, descuento de stock, pantalla de pedido confirmado). |
| Carga de nuevo producto (opcional) | ⬜ | ⬜ | Solo admin (`isAdmin`, con `AdminGuard`). Incluye stock. |

### Infraestructura y piezas transversales

| Pieza | Estado | Notas |
| --- | --- | --- |
| Proyecto Angular | 🟨 | Estructura: `core/auth/` (sesión, API, interceptor, guard, política de contraseña), `core/productos/` (modelo `Producto`, `ListadoPaginado` y servicio `ProductosApi`), `layout/header/` (barra global: marca, Ingresar o nombre + Salir), `shared/aviso/` y `features/` (rutas lazy). Íconos con Material Symbols (`MatIconRegistry`), marcados `aria-hidden` cuando son decorativos. Faltan en el header los links a Productos / Cargar producto, el carrito y el menú para celular, y la pantalla 404 (`**` redirige a `/productos`). |
| Proyecto NestJS | ✅ | Arquitectura global configurada (config, TypeORM, JWT, serve-static, prefijo `/api`, security headers). Módulos de feature: `auth`, `usuarios` y `productos`. |
| Base de datos y ORM | ✅ | TypeORM 1.x + SQLite (`better-sqlite3`), archivo en `DB_PATH` (por defecto `server/data/tw2market.sqlite`; en Docker `/app/data`, que conviene montar como volumen para no perder datos). Migraciones en `src/db/migrations/` (se ejecutan al iniciar si `DB_MIGRATIONS_RUN=true`). Entidades `Usuario` (`src/entities/usuario.entity.ts`) y `Producto` (`src/entities/producto.entity.ts`). Migraciones de productos: `CrearProductos` (tabla), `SeedProductos` (seed inicial, 6 celulares, ya ejecutada), `AmpliarProductos` (agrega marca/imagen/specs técnicas y limpia los datos viejos), `SeedProductosCompleto` (carga 10 celulares con ficha completa). En los e2e el esquema se sincroniza (`DB_SYNCHRONIZE=true`), porque Vitest no carga las migraciones compiladas. |
| Configuración por entorno | ✅ | `@nestjs/config` global + Joi. La app no arranca si falta una variable requerida (hoy solo `JWT_SECRET`). Plantilla en `server/.env.example`. |
| Validación global (backend) | ✅ | `ValidationPipe` como `APP_PIPE` (`whitelist`, `forbidNonWhitelisted`, `transform`); DTOs con class-validator en cada feature (`<feature>.dto.ts`). |
| Autenticación (JWT, guards) | ✅ | Módulo `src/modules/auth/`: `JwtAuthGuard` como `APP_GUARD` (**toda ruta exige JWT salvo las marcadas con `@Public()`**), `LocalAuthGuard`, `AdminGuard` (403 si no es admin), `JwtStrategy` (verifica que el usuario exista y lo deja en `request.user` sin el hash) y `LocalStrategy`. Contraseñas con bcrypt (factor 16). Los endpoints de productos usan `@Public()`. |
| Comunicación client ↔ server | 🟨 | Backend: prefijo global `/api`, sin CORS (mismo origen en producción). Cliente: proxy de desarrollo de `ng serve` hacia `http://localhost:3000` para `/api` (`client/proxy.conf.json`, referenciado en `angular.json`). `provideHttpClient` con `authInterceptor`. |
| Servir el frontend desde el backend | 🟨 | `@nestjs/serve-static` sirve `server/public` (= `/app/public` en Docker) con fallback a `index.html`; `/api/*` queda excluido (404 JSON). La ruta del `Dockerfile` es correcta. El `.dockerignore` de la raíz excluye `node_modules`, `.env`, builds locales, bases SQLite y `.git` del contexto. La CSP por defecto de `useSecurityHeaders()` funciona con el build sin cambios en el backend: el build de producción desactiva `inlineCritical` en `angular.json`, porque su script inline para cargar el CSS quedaba bloqueado por `script-src 'self'`; las fuentes de Google se incrustan en el build. Verificado copiando el build a `server/public`; falta probar la imagen Docker. |
| Tests | 🟨 | Backend: unit del esquema de entorno y e2e del guard JWT / exclusión de `/api` (SQLite en memoria, no requiere configurar una DB). Sin tests de signup/signin ni de productos. Frontend: solo los tests de ejemplo del CLI. |
| Control de versiones | ✅ | Rama `main` con el commit inicial de scaffolding. |
| CI (GitHub Actions) | ✅ | `.github/workflows/ci.yml`: en cada PR (y push a `main`) corre, en jobs paralelos con Node 24, `npm ci` + tests + build del cliente, y `npm ci` + lint + tests unit + e2e + build del servidor. Funciona en GitHub. |

### Mocks activos

Lista de todo lo que hoy está simulado y debe reemplazarse por una implementación real. Incluir ubicación (archivo) y qué falta para reemplazarlo.

- **Imágenes de productos** (seed `SeedProductosCompleto`, campo `imagenUrl`): usan placeholders generados en `placehold.co` con el nombre del modelo. Reemplazar por fotos reales de cada equipo (propias o con licencia de uso) antes de la entrega.
- **Botones "Agregar al carrito" / "Comprar ahora"** (`client/src/app/features/productos/producto-detalle/producto-detalle.html`): están deshabilitados, sin handler. Se habilitan cuando se implemente la funcionalidad de carrito (fuera del alcance de esta tarea).

### Decisiones pendientes

- _(ninguna por el momento)_

### Decisiones tomadas

- **Política de contraseña:** al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo. Es la misma regla en frontend (checklist en vivo) y backend (fuente de verdad).
- **Recupero de contraseña descartado:** es opcional, y sin envío real de emails quedaría como un botón que no hace nada, lo que la cátedra pide evitar. No hay link, ruta ni endpoint.
- **Ficha de producto completa:** además de nombre, descripción, clasificación y precio (mínimo del enunciado), se agregaron marca, imagen y especificaciones técnicas (pantalla, almacenamiento, RAM, batería, cámara). El enunciado no lo pide explícitamente, pero una landing y un detalle de producto sin esta información no representan correctamente un ecommerce, y el profesor pidió explícitamente no limitarse a "pantallas con botones que visualmente parezcan funcionar".
- **Visualización de productos, pública y sin autenticación:** el listado y el detalle no requieren sesión (`@Public()`), coherente con que agregar al carrito sí la va a requerir.
- **Listado paginado desde el backend:** query params `pagina`, `limite` (máx. 50) y `busqueda` (filtra por nombre/marca); el frontend hoy pide `limite: 50` para mostrar todo en una sola página mientras no se arma paginación visual. El filtro por clasificación (chips en la landing) se resuelve client-side sobre ese resultado.
- Features del backend en `server/src/modules/<feature>/` (ver `server/AGENTS.md`).
- Autenticación con JWT; contraseñas hasheadas.
- **Sesión en el cliente:** el token se guarda en `localStorage` (sobrevive a recargas) y el header lee nombre y apellido del payload del JWT, sin pedirlos a otro endpoint.
- Capas estrictas en backend: controller → service → repository.
- Base de datos: SQLite (`better-sqlite3`) con TypeORM y migraciones (sin `synchronize` por defecto): no requiere un servidor de base de datos, lo que simplifica el desarrollo y el despliegue del TP.
- Autenticación con Passport (`passport-jwt`) y guard global con opt-out mediante `@Public()`.
- Validación con clases DTO de class-validator y `ValidationPipe` global.
- UI del cliente con Angular Material (componentes) y Bootstrap (grilla y utilidades de layout).
- Los flujos entre pantallas y las reglas de UX están en [`docs/PROTOTIPOS.md`](docs/PROTOTIPOS.md#flujos-y-reglas-transversales), y prevalecen sobre las imágenes. La cátedra pide coherencia entre funcionalidades sin ampliar el alcance.
- **Rol simulado con el flag `isAdmin`** del usuario: el signup crea usuarios con `isAdmin = false` y el admin se carga por seed. Solo el admin carga productos (403 en el backend). El enunciado separa comprar de cargar productos, y la cátedra aclara que alcanza con simularlo.
- **Carrito en el servidor, asociado al usuario.** El catálogo es público y agregar al carrito requiere sesión. Así hay un solo modelo, sin fusionar carritos anónimos.
- **Stock simple:** campo `stock` en el producto, el carrito no supera el stock, y al confirmar se valida y descuenta en una transacción (409 si falta). La cátedra pide evitar compras de más unidades que las disponibles.
- **Pedido:** guarda el precio de cada ítem al confirmar, el pago es simulado (siempre aprobado), se vacía el carrito y se muestra una pantalla de confirmación con la dirección del usuario. La operación tiene que tener un resultado visible.
- **Fuera de alcance**, porque el enunciado no lo pide: historial de pedidos, edición y baja de productos, gestión de roles y permisos avanzados.
- Productos de ejemplo y usuario admin precargados por migración, para que la app se pueda usar desde el primer arranque.

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