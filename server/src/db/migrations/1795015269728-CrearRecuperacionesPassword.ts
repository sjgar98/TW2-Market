import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearRecuperacionesPassword1795015269728 implements MigrationInterface {
  name = 'CrearRecuperacionesPassword1795015269728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recuperaciones_password" ("id" varchar PRIMARY KEY NOT NULL, "usuarioId" varchar NOT NULL, "tokenHash" text NOT NULL, "creadoEn" datetime NOT NULL, "expiraEn" datetime NOT NULL, "usadoEn" datetime, CONSTRAINT "UQ_recuperaciones_password_usuarioId" UNIQUE ("usuarioId"), CONSTRAINT "UQ_recuperaciones_password_tokenHash" UNIQUE ("tokenHash"), CONSTRAINT "FK_recuperaciones_password_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "recuperaciones_password"`);
  }
}
