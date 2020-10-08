export class FamilleDTO {
  public type = '';
  public famille = 0;
  public libelleF = '';
  public libelleN = '';
}

export class Famille extends FamilleDTO {
  constructor(dto?: FamilleDTO) {
    super();
    Object.assign(this, dto || new FamilleDTO());
  }
}
