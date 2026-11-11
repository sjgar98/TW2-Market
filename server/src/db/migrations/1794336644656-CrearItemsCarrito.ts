import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearItemsCarrito1794336644656 implements MigrationInterface {
    name = 'CrearItemsCarrito1794336644656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "items_carrito" ("id" varchar PRIMARY KEY NOT NULL, "cantidad" integer NOT NULL DEFAULT (1), "usuarioId" varchar NOT NULL, "productoId" varchar NOT NULL, CONSTRAINT "UQ_4d9af5483579db5cec5ca0dfe6e" UNIQUE ("usuarioId", "productoId"))`);
        await queryRunner.query(`CREATE TABLE "temporary_items_carrito" ("id" varchar PRIMARY KEY NOT NULL, "cantidad" integer NOT NULL DEFAULT (1), "usuarioId" varchar NOT NULL, "productoId" varchar NOT NULL, CONSTRAINT "UQ_4d9af5483579db5cec5ca0dfe6e" UNIQUE ("usuarioId", "productoId"), CONSTRAINT "FK_eaed3b6a6e137818b32f8b193c6" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a2ed7810a96638279e5f8b85c18" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_items_carrito"("id", "cantidad", "usuarioId", "productoId") SELECT "id", "cantidad", "usuarioId", "productoId" FROM "items_carrito"`);
        await queryRunner.query(`DROP TABLE "items_carrito"`);
        await queryRunner.query(`ALTER TABLE "temporary_items_carrito" RENAME TO "items_carrito"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items_carrito" RENAME TO "temporary_items_carrito"`);
        await queryRunner.query(`CREATE TABLE "items_carrito" ("id" varchar PRIMARY KEY NOT NULL, "cantidad" integer NOT NULL DEFAULT (1), "usuarioId" varchar NOT NULL, "productoId" varchar NOT NULL, CONSTRAINT "UQ_4d9af5483579db5cec5ca0dfe6e" UNIQUE ("usuarioId", "productoId"))`);
        await queryRunner.query(`INSERT INTO "items_carrito"("id", "cantidad", "usuarioId", "productoId") SELECT "id", "cantidad", "usuarioId", "productoId" FROM "temporary_items_carrito"`);
        await queryRunner.query(`DROP TABLE "temporary_items_carrito"`);
        await queryRunner.query(`DROP TABLE "items_carrito"`);
    }

}
