import type { MigrationInterface, QueryRunner } from 'typeorm';

const ADMIN_ID = 'f661d923-94cc-4ddf-a210-281e9318ef2b';

export class Migration1793919861453 implements MigrationInterface {
  name = 'Migration1793919861453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" varchar PRIMARY KEY NOT NULL, "email" text NOT NULL, "passwordHash" text NOT NULL, "nombre" text NOT NULL, "apellido" text NOT NULL, "direccion" text NOT NULL, "isAdmin" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `INSERT INTO "usuarios" ("id", "email", "passwordHash", "nombre", "apellido", "direccion", "isAdmin") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ADMIN_ID,
        'juan.perez@test.com',
        '$2b$16$DS7yG2uXGSV.q7j8CcaxJuzvqGkpbk4/x0EBnGt.NVnlV4L5jQO4W',
        'Admin',
        'User',
        'Calle 123',
        1,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "usuarios" WHERE "id" = ?`, [
      ADMIN_ID,
    ]);
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
