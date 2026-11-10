import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductosCompleto1794075531341 implements MigrationInterface {
  name = 'SeedProductosCompleto1794075531341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO productos (id, nombre, marca, descripcion, clasificacion, precio, stock, imagenUrl, pantalla, almacenamientoGb, ramGb, bateriaMah, camara) VALUES
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000001', 'iPhone 15', 'Apple', 'El iPhone 15 suma el chip A16 Bionic, Dynamic Island y una cámara principal de 48MP con zoom óptico 2x. Pantalla Super Retina XDR con mayor brillo y Ceramic Shield resistente a caídas.', 'Gama alta', 1199999.00, 8, 'https://placehold.co/600x600/1d1d1f/ffffff?text=iPhone+15', '6.1" Super Retina XDR OLED', 128, 6, 3349, '48MP principal + 12MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000002', 'Samsung Galaxy S24', 'Samsung', 'El Galaxy S24 incorpora funciones de Galaxy AI, pantalla Dynamic AMOLED 2X con hasta 120Hz y procesador Exynos/Snapdragon según mercado. Cuerpo de titanio y Gorilla Glass Victus 2.', 'Gama alta', 1099999.00, 10, 'https://placehold.co/600x600/1428a0/ffffff?text=Galaxy+S24', '6.2" Dynamic AMOLED 2X', 256, 8, 4000, '50MP principal + 12MP ultra gran angular + 10MP teleobjetivo'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000003', 'Motorola Edge 40', 'Motorola', 'El Edge 40 combina un diseño curvo ultradelgado con pantalla pOLED de 144Hz y carga TurboPower de 68W que lo lleva de 0 a 100% en menos de 40 minutos.', 'Gama media', 549999.00, 15, 'https://placehold.co/600x600/6228d7/ffffff?text=Edge+40', '6.55" pOLED 144Hz', 256, 8, 4400, '50MP principal OIS + 13MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000004', 'Xiaomi Redmi Note 13', 'Xiaomi', 'El Redmi Note 13 ofrece una cámara principal de 108MP, pantalla AMOLED curva y certificación IP54 contra salpicaduras, a un precio pensado para el día a día.', 'Gama media', 329999.00, 20, 'https://placehold.co/600x600/ff6900/ffffff?text=Redmi+Note+13', '6.67" AMOLED 120Hz', 128, 8, 5000, '108MP principal + 8MP ultra gran angular + 2MP macro'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000005', 'Samsung Galaxy A15', 'Samsung', 'El Galaxy A15 es una opción de entrada con pantalla Super AMOLED grande, batería de larga duración y Android con cuatro años de actualizaciones garantizadas.', 'Gama baja', 219999.00, 25, 'https://placehold.co/600x600/1428a0/ffffff?text=Galaxy+A15', '6.5" Super AMOLED', 128, 4, 5000, '50MP principal + 5MP ultra gran angular + 2MP macro'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000006', 'iPhone 13', 'Apple', 'El iPhone 13 sigue vigente con el chip A15 Bionic, modo Cinemático en video y una excelente relación rendimiento-batería, ahora a un precio más accesible.', 'Gama alta', 899999.00, 0, 'https://placehold.co/600x600/1d1d1f/ffffff?text=iPhone+13', '6.1" Super Retina XDR OLED', 128, 4, 3240, '12MP principal + 12MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000007', 'Google Pixel 8', 'Google', 'El Pixel 8 destaca por su cámara computacional con Tensor G3, funciones de IA como Borrador Mágico y Android puro con actualizaciones directas de Google por 7 años.', 'Gama alta', 999999.00, 6, 'https://placehold.co/600x600/4285f4/ffffff?text=Pixel+8', '6.2" Actua OLED 120Hz', 128, 8, 4575, '50MP principal + 12MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000008', 'Motorola Moto G54', 'Motorola', 'El Moto G54 suma conectividad 5G, pantalla de 120Hz y un diseño con acabado de cuero vegano en su variante especial, ideal para quienes buscan fluidez sin gastar de más.', 'Gama media', 279999.00, 18, 'https://placehold.co/600x600/6228d7/ffffff?text=Moto+G54', '6.5" IPS LCD 120Hz', 256, 8, 5000, '50MP principal OIS + 8MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000009', 'Xiaomi Poco X6', 'Xiaomi', 'El Poco X6 apunta a gamers y usuarios exigentes con pantalla AMOLED curva de 1.5K, carga de 67W y procesador Dimensity orientado al rendimiento.', 'Gama media', 399999.00, 12, 'https://placehold.co/600x600/ff6900/ffffff?text=Poco+X6', '6.67" AMOLED curva 120Hz', 256, 8, 5100, '64MP principal OIS + 8MP ultra gran angular'),
      ('b1a7c1b0-1a2b-4c3d-8e4f-000000000010', 'Samsung Galaxy A05', 'Samsung', 'El Galaxy A05 es la puerta de entrada al ecosistema Samsung: pantalla grande, batería de 5000mAh y un precio accesible para un primer smartphone.', 'Gama baja', 149999.00, 30, 'https://placehold.co/600x600/1428a0/ffffff?text=Galaxy+A05', '6.7" PLS LCD', 64, 4, 5000, '50MP principal + 2MP profundidad');
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
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000006',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000007',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000008',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000009',
        'b1a7c1b0-1a2b-4c3d-8e4f-000000000010'
      );
    `);
  }
}