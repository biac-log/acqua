export class FournisseurParamsDTO {
  public nextNumero = 0;
  public numeroCompteAssocieDefaut = 0;
  public nomCompteAssocieDefaut = '';
}

export class FournisseurParams extends FournisseurParamsDTO {
  constructor(dto?: FournisseurParamsDTO) {
    super();
    Object.assign(this, dto || new FournisseurParamsDTO());
  }
}
