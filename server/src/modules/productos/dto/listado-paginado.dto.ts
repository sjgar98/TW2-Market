export class ListadoPaginadoDto<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly pagina: number,
    public readonly limite: number,
  ) {}
}