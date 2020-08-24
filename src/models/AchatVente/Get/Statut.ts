export interface IStatut {
  id: number;
  libelle: string;
}

export class StatutDTO implements IStatut {
  public id = 0;
  public libelle = '';
}

export class Statut extends StatutDTO {
  constructor(dto?: StatutDTO) {
    super();
    Object.assign(this, dto || new StatutDTO());
  }
}
