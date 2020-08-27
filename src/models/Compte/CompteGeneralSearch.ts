export interface ICompteGeneralSearch {
  type: string;
  numero: number;
  nom: string;
  solde: number;
  nature: string;
  libelleNature: string;
  numeroCase: number;
  libelleCase: string;
}

export class CompteGeneralSearchDTO implements ICompteGeneralSearch {
  type = '';
  numero = 0;
  nom = '';
  solde = 0;
  nature = '';
  libelleNature = '';
  numeroCase = 0;
  libelleCase = '';
}

export class CompteGeneralSearch extends CompteGeneralSearchDTO {
  constructor(dto: CompteGeneralSearchDTO) {
    super();
    Object.assign(this, dto);
  }

  get libelleSolde() {
    return this.solde.toDecimalString(2);
  }

  get numeroNom() {
    return `${this.numero} ${this.nom}`;
  }

  get caseTvaDisplay() {
    return `${this.numeroCase ? this.numeroCase : ''} ${this.libelleCase ? this.libelleCase : ''}`;
  }
}
