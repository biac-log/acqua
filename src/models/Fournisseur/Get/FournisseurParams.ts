export class LibelleTiers {
  public code = 0;
  public valeur = '';
  public saisieIntra = '';

   get displayName(): string {
    return `${this.code} - ${this.valeur}`;
  }
}

export class FournisseurParamsDTO {
  public nextNumero = 0;
  public numeroCompteAssocieDefaut = 0;
  public nomCompteAssocieDefaut = '';
  public libellesAssujettis: LibelleTiers[] = [];
  public codeSuivis: LibelleTiers[] = [];
}

export class FournisseurParams extends FournisseurParamsDTO {
  constructor(dto?: FournisseurParamsDTO) {
    super();
    Object.assign(this, dto || new FournisseurParamsDTO());
  }
}
