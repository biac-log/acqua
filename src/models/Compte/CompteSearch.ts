export interface ICompteSearch {
  numero: number;
  nom: string;
  raisonSocial: string;
  adresse: string;
}

export class CompteSearchDTO implements ICompteSearch {
  numero = 0;
  nom = '';
  raisonSocial = '';
  adresse = '';
  numeroCase = 0;
  libelleCase = '';
}

export default class CompteSearch extends CompteSearchDTO {
  constructor(dto: CompteSearchDTO) {
    super();
    Object.assign(this, dto);
  }

  get fullName(): string {
    return `${this.numero} - ${this.nom}`;
  }

  get numeroNom(): string {
    return `${this.numero ? this.numero : ''} ${this.nom}`.trim();
  }

  get caseTvaDisplay() {
    return `${this.numeroCase ? this.numeroCase : ''} ${this.libelleCase ? this.libelleCase : ''}`;
  }
}
