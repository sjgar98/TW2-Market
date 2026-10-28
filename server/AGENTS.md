You are an expert in TypeScript, Node.js, NestJS, and scalable server-side application development. You write functional, maintainable, performant, and secure code following NestJS and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Always declare explicit return types on public controller and service methods
- Use `import type` for imports used only as types, except for classes injected through constructors (Nest needs their runtime reference for `emitDecoratorMetadata`)

## Comments and Self-Documenting Code

- Write self-documenting code: clear names, small focused functions and explicit types should make the intent obvious without comments
- Do NOT add descriptive comments that restate what the code does
- Only add a comment when the code cannot be made clear enough on its own (e.g. a non-obvious workaround or constraint), or to record a deliberate developer decision and its reason

## Project Conventions

- This project is native ESM (`"type": "module"`, `"module": "nodenext"`). Relative imports MUST include the `.js` extension, e.g. `import { UsersService } from './users.service.js'`
- Use top-level `await` in `main.ts`; do not leave promises floating (`typescript/no-floating-promises` is an error)
- Use the Nest CLI (`nest g resource`, `nest g module`, `nest g service`, ...) to scaffold new building blocks so naming and file layout stay consistent. Prefix feature paths with `modules/` (e.g. `nest g resource modules/users`) so they land in `src/modules/`
- Lint with `npm run lint` (oxlint, type-aware) and format with `npm run format` (Prettier: single quotes, trailing commas)
- Read configuration from the environment (e.g. `process.env.PORT ?? 3000`) at the edges of the app; do not read `process.env` deep inside services. Use `@nestjs/config` with a validated schema once configuration grows beyond a few values

## Project Infrastructure

- Configuration: add every new environment variable to `envValidationSchema` and `EnvironmentVariables` in `src/config/env.validation.ts`, and to `.env.example`. Read it with `ConfigService<EnvironmentVariables, true>` and `config.get('KEY', { infer: true })`
- Database: TypeORM with SQLite (`better-sqlite3`); the file path comes from `DB_PATH` (`:memory:` in e2e tests). Entities live in `src/entities/<name>.entity.ts` (loaded by the `dist/**/*.entity.js` glob) and are registered in each feature with `TypeOrmModule.forFeature([...])`. Never enable `DB_SYNCHRONIZE` outside local experiments; generate migrations with `npm run migration:generate` (compares the entities against the database at `DB_PATH`, so run pending migrations first) and format them with `npm run format`
- Authentication: `JwtAuthGuard` is registered globally, so every route requires a Bearer JWT by default. Mark public routes (signup, signin, product listing, ...) with `@Public()` from `src/common/decorators/public.decorator.ts`. Sign tokens with the global `JwtService`
- All API routes are served under the `/api` prefix (`configureApp()` in `src/app.setup.ts`); everything else is served from `public/` (the Angular build)

## Architecture

- Organize code by feature: one folder per domain under `src/modules/` (`src/modules/users/`, `src/modules/orders/`), each with its own module, controller, service, and schemas
- Keep `AppModule` thin; it only composes feature and infrastructure modules
- Each module MUST export only the providers other modules need; keep everything else private
- Do NOT create circular module dependencies. Avoid `forwardRef()`; if two modules need each other, extract the shared logic into a third module
- Use `@Global()` only for true cross-cutting infrastructure (config, logging, database). Feature modules must be imported explicitly
- Use dynamic modules (`forRoot()` / `forRootAsync()` / `register()`) or `ConfigurableModuleBuilder` for reusable, configurable modules
- Use the standard file naming: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.guard.ts`, `<name>.spec.ts`, ...

## Controllers

- Keep controllers thin: parse the request, call a service, return the result. No business logic, no data access
- Use one controller per resource, with a resource-based route prefix (`@Controller('users')`)
- Return plain objects or DTOs and let Nest serialize them. Do NOT inject `@Res()` unless you need to stream or fully control the response; if you must, use `@Res({ passthrough: true })`
- Use `StreamableFile` to return files or streams instead of writing to the raw response
- Use `@HttpCode()` and `@Header()` for status codes and static headers instead of manipulating the response object
- Use built-in parsing pipes for primitive params: `ParseIntPipe`, `ParseUUIDPipe`, `ParseBoolPipe`, `ParseEnumPipe`, `ParseDatePipe`, `ParseArrayPipe`, `DefaultValuePipe`
- Routes run on Express 5: wildcards must be named (`*splat`, `{*splat}`), and optional segments use braces (`/files{/:name}`)
- Declare literal routes before parametric ones (`/users/me` before `/users/:id`), or set `routeResolutionStrategy: 'specificity'` in `NestFactory.create()` options

## Validation

- Validate ALL external input: bodies, params, queries, and headers
- Prefer Standard Schema validation (built in since NestJS v12) for new code. Attach a schema (Zod, Valibot, ArkType, ...) directly to the parameter decorator and register `StandardSchemaValidationPipe` globally:
  ```ts
  @Post()
  create(@Body({ schema: createUserSchema }) dto: CreateUserDto): Promise<User> { ... }
  ```
- Derive DTO types from the schema (e.g. `type CreateUserDto = z.infer<typeof createUserSchema>`) instead of declaring them twice
- If using `class-validator` with `ValidationPipe` instead, always set `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`
- Do NOT trust the shape of incoming data inside services; services receive already validated, typed input

## Providers and Dependency Injection

- Design services around a single responsibility
- Use constructor injection with `private readonly` parameters
- Depend on abstractions where it helps testing or swapping implementations: inject by token (`@Inject(TOKEN)`) with an `InjectionToken` / `Symbol`, not by string literals
- Use the default singleton scope. Avoid `Scope.REQUEST` and `Scope.TRANSIENT` unless strictly necessary; request scope bubbles up the dependency chain and hurts performance. Use `AsyncLocalStorage` (e.g. `nestjs-cls`) for per-request context instead
- Use `useFactory` / `useValue` / `useClass` providers for configuration and third-party clients; keep `new` out of services
- Use lifecycle hooks (`OnModuleInit`, `OnApplicationShutdown`, ...) for setup and teardown of connections, and call `app.enableShutdownHooks()` in `main.ts`

## Error Handling

- Throw built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`, ...) instead of returning error objects or status codes
- Keep the domain layer free of HTTP concerns where practical: throw domain errors from services and map them to HTTP exceptions in an exception filter
- Use a global exception filter for consistent error responses and logging. Never leak stack traces or internal messages to clients
- Do NOT swallow errors with empty `catch` blocks

## Request Pipeline

- Respect the execution order: middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → exception filters
- Use guards (`CanActivate`) for authentication and authorization, not middleware or interceptors
- Use custom metadata decorators (`Reflector.createDecorator()`) for roles, permissions, and `@Public()` markers, and read them in guards with `Reflector`
- Use interceptors for cross-cutting concerns: response mapping, caching, timing, timeouts
- Use `createParamDecorator()` for custom parameter extraction (e.g. `@CurrentUser()`)
- Register global pipes, guards, interceptors, and filters with `APP_PIPE`, `APP_GUARD`, `APP_INTERCEPTOR`, and `APP_FILTER` providers so they participate in DI, rather than `app.useGlobal*()`

## Security

- Call `app.useSecurityHeaders()` in `main.ts` (built in since v12; helmet-equivalent defaults including a CSP). Do NOT add `helmet` separately
- Call `app.enableCsrfProtection()` when the app uses cookie-based authentication
- Configure CORS explicitly with `app.enableCors({ origin: [...] })`; never use a wildcard origin with credentials
- Apply rate limiting (`@nestjs/throttler`) to public and authentication endpoints
- Never log secrets, tokens, passwords, or full request bodies containing personal data
- Hash passwords with a slow algorithm (argon2 or bcrypt); never store or return them

## Data and Persistence

- Isolate data access in repositories or dedicated services; controllers never talk to the database directly
- Never return persistence entities directly when they contain internal or sensitive fields; map to response DTOs
- Use transactions for multi-step writes
- Paginate list endpoints; never return unbounded collections

## Async and Performance

- Use `async`/`await` with Promises for request handling. Use RxJS only where Nest's APIs expect Observables (interceptors, microservices, SSE)
- Never block the event loop with synchronous I/O (`fs.readFileSync`, etc.) or heavy CPU work in request handlers
- Run independent async operations concurrently with `Promise.all()`
- Set `routeConflictPolicy: { duplicate: 'error', shadow: 'warn' }` in `NestFactory.create()` options to catch conflicting routes at bootstrap

## Logging

- Use Nest's `Logger` (`private readonly logger = new Logger(MyService.name)`) instead of `console.log`
- Log with context and at the right level (`error`, `warn`, `log`, `debug`, `verbose`)

## Testing

- Tests use Vitest with globals enabled. Unit tests live next to the source as `*.spec.ts`; e2e tests live in `test/` as `*.e2e-spec.ts`
- Build unit tests with `Test.createTestingModule()` and replace dependencies with `useValue` mocks (`vi.fn()`) or `.overrideProvider()`
- Test services for business logic, and controllers only for wiring and HTTP mapping
- Write e2e tests with `supertest` against `app.getHttpServer()`, and always `await app.close()` in `afterEach` / `afterAll`
- Apply the same global configuration (pipes, filters, prefixes) in e2e setup as in `main.ts`; extract it into a shared `configureApp(app)` function so they cannot drift
- Do not assume globals like `Date.now()` are stable in tests; use `vi.useFakeTimers()` or inject a clock
