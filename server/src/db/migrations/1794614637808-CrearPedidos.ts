import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearPedidos1794614637808 implements MigrationInterface {
  name = 'CrearPedidos1794614637808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pedidos" ("id" varchar PRIMARY KEY NOT NULL, "direccionEnvio" text NOT NULL, "total" decimal(10,2) NOT NULL, "creadoEn" datetime NOT NULL DEFAULT (datetime('now')), "usuarioId" varchar NOT NULL, CONSTRAINT "FK_e60a655127c227b5e063e73165b" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE TABLE "items_pedido" ("id" varchar PRIMARY KEY NOT NULL, "cantidad" integer NOT NULL, "precioUnitario" decimal(10,2) NOT NULL, "pedidoId" varchar NOT NULL, "productoId" varchar NOT NULL, CONSTRAINT "FK_d77079f4f09c62512e117aa19f4" FOREIGN KEY ("pedidoId") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_991bcab760b989be7a938145ce9" FOREIGN KEY ("productoId") REFERENCES "productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "items_pedido"`);
    await queryRunner.query(`DROP TABLE "pedidos"`);
  }
}
