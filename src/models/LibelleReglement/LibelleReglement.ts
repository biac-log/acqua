export interface ILibelleReglement {
  debut: string;
  numero: number;
  libelle: string;
}

export class LibelleReglementDTO implements ILibelleReglement {
  debut = '';
  numero = 0;
  libelle = '';
}

export class LibelleReglement extends LibelleReglementDTO {
  constructor(dto?: LibelleReglementDTO) {
    super();
    Object.assign(this, dto || new LibelleReglementDTO());
  }
}
