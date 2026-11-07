import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearProductos1794075531338 implements MigrationInterface {
    name = 'CrearProductos1794075531338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "productos" ("id" varchar PRIMARY KEY NOT NULL, "nombre" varchar(150) NOT NULL, "descripcion" text NOT NULL, "clasificacion" varchar(80) NOT NULL, "precio" decimal(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT (0))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "productos"`);
    }

}
