import type { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';

// Configuración global compartida por main.ts y los tests e2e, para que no diverjan
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix(API_PREFIX);
  app.useSecurityHeaders();
  app.enableShutdownHooks();
  return app;
}
