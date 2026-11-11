import { MigrationInterface, QueryRunner } from 'typeorm';

export class AmpliarProductos1794075531340 implements MigrationInterface {
  name = 'AmpliarProductos1794075531340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN marca varchar(80) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN imagenUrl varchar(500) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN pantalla varchar(80) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN almacenamientoGb integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN ramGb integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN bateriaMah integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE productos ADD COLUMN camara varchar(150) NOT NULL DEFAULT '';
    `);

    await queryRunner.query(`
      DELETE FROM productos;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN camara;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN bateriaMah;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN ramGb;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN almacenamientoGb;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN pantalla;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN imagenUrl;`);
    await queryRunner.query(`ALTER TABLE productos DROP COLUMN marca;`);
  }
}