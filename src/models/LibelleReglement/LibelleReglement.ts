export interface ILibelleReglement {
  numero: number;
  libelle: string;
  hash: string;
}

export class LibelleReglementDTO implements ILibelleReglement {
  numero = 0;
  libelle = '';
  hash = '';
}

export class LibelleReglement extends LibelleReglementDTO {
  constructor(dto?: LibelleReglementDTO) {
    super();
    Object.assign(this, dto || new LibelleReglementDTO());
  }

  public static rules = {
    numero: [(v: string) => !v || !!v.toNumber() || v.toNumber() > 1 || v.toNumber() < 99 || 'Nombre invalide']
  };
}
