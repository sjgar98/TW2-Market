import { MigrationInterface, QueryRunner } from 'typeorm';

export class EliminarClasificacionProducto1795194000000 implements MigrationInterface {
  name = 'EliminarClasificacionProducto1795194000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" DROP COLUMN "clasificacion"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "productos" ADD "clasificacion" varchar(80) NOT NULL DEFAULT ''`,
    );
  }
}
