export class PaginationResultDTO<T> {
  public totalCount: number= 0;
  public items: T[] = [];
}

export class PaginationResult<T> extends PaginationResultDTO<T> {
  constructor(dto?: PaginationResultDTO<T>){
    super();
    Object.assign(this, dto || new PaginationResultDTO<T>());
  }
}