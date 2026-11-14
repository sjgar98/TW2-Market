const FORMATO_PRECIO = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function formatearPrecio(precio: number): string {
  return FORMATO_PRECIO.format(precio);
}
