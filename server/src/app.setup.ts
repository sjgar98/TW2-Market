import type { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';

export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix(API_PREFIX);
  app.useSecurityHeaders();
  app.enableShutdownHooks();
  return app;
}
