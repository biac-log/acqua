export interface ICompteContrepartieSearch {
  numero: number;
  nom: string;
  solde: number;
  nature: string;
  caseTva: string;
}

export class CompteContrepartieSearchDTO implements ICompteContrepartieSearch {
  numero = 0;
  nom = '';
  solde = 0;
  nature = '';
  caseTva = '';
}

export class CompteContrepartieSearch extends CompteContrepartieSearchDTO {
  constructor(dto: CompteContrepartieSearchDTO) {
    super();
    Object.assign(this, dto);
  }
}
