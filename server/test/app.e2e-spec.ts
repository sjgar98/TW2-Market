import { Controller, Get, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { Public } from './../src/common/decorators/public.decorator.js';

// Controller de prueba: la app todavía no tiene feature modules con rutas propias
@Controller('e2e')
class E2eController {
  @Public()
  @Get('public')
  getPublic(): { ok: boolean } {
    return { ok: true };
  }

  @Get('protected')
  getProtected(): { ok: boolean } {
    return { ok: true };
  }
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [E2eController],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows public routes without a token', () => {
    return request(app.getHttpServer())
      .get('/api/e2e/public')
      .expect(200)
      .expect({ ok: true });
  });

  it('rejects protected routes without a token', () => {
    return request(app.getHttpServer()).get('/api/e2e/protected').expect(401);
  });

  it('rejects protected routes with an invalid token', () => {
    return request(app.getHttpServer())
      .get('/api/e2e/protected')
      .auth('not-a-jwt', { type: 'bearer' })
      .expect(401);
  });

  it('allows protected routes with a valid token', async () => {
    const token = await jwtService.signAsync({ sub: 'user-id' });

    return request(app.getHttpServer())
      .get('/api/e2e/protected')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect({ ok: true });
  });

  it('returns 404 for unknown API routes instead of the frontend', () => {
    return request(app.getHttpServer()).get('/api/unknown').expect(404);
  });
});
