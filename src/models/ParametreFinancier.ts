export interface IParametreFinancier {
  numeroCompte: number;
  libelle: string;
}

export class ParametreFinancierDTO implements IParametreFinancier {
  numeroCompte = 0;
  libelle = '';
}

export class ParametreFinancier extends ParametreFinancierDTO {
  constructor(dto?: ParametreFinancierDTO) {
    super();
    Object.assign(this, dto || new ParametreFinancierDTO());
  }
}
