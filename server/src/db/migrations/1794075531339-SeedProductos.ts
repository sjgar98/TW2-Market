import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductos1794075531339 implements MigrationInterface {
  name = 'SeedProductos1794075531339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO productos (id, nombre, descripcion, clasificacion, precio, stock) VALUES
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000001', 'iPhone 15', 'Apple iPhone 15 128GB, pantalla Super Retina XDR de 6.1", chip A16 Bionic.', 'Gama alta', 1199999.00, 8),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000002', 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB, pantalla Dynamic AMOLED 2X de 6.2", cámara 50MP.', 'Gama alta', 1099999.00, 10),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000003', 'Motorola Edge 40', 'Motorola Edge 40 256GB, pantalla pOLED 144Hz, carga rápida 68W.', 'Gama media', 549999.00, 15),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000004', 'Xiaomi Redmi Note 13', 'Xiaomi Redmi Note 13 128GB, cámara 108MP, batería 5000mAh.', 'Gama media', 329999.00, 20),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000005', 'Samsung Galaxy A15', 'Samsung Galaxy A15 128GB, pantalla Super AMOLED, ideal gama inicial.', 'Gama baja', 219999.00, 25),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000006', 'iPhone 13', 'Apple iPhone 13 128GB, chip A15 Bionic, cámara dual 12MP.', 'Gama alta', 899999.00, 0);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM productos WHERE id IN (
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000001',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000002',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000003',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000004',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000005',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000006'
      );
    `);
  }
}