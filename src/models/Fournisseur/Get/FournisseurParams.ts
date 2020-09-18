export class FournisseurParamsDTO {
  public nextNumero = 0;
  public compteAssocieDefaut = 0;
}

export class FournisseurParams extends FournisseurParamsDTO {
  constructor(dto?: FournisseurParamsDTO) {
    super();
    Object.assign(this, dto || new FournisseurParamsDTO());
  }
}
