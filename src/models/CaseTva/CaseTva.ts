export interface ICaseTva {
  numeroCase: number;
  libelleCase: string;
  natureCase: string;
  tauxTvaCase: number;
  typeCase: number;
  libelleTypeCase: string;
  codePays: string;
}

export class CaseTvaDTO implements ICaseTva {
  numeroCase = 0;
  libelleCase = '';
  natureCase = '';
  tauxTvaCase = 0;
  typeCase = 0;
  libelleTypeCase = '';
  codePays = '';
}

export class CaseTva extends CaseTvaDTO {
  constructor(dto?: CaseTvaDTO) {
    super();
    Object.assign(this, dto || new CaseTvaDTO());
  }

  public refresh(dto?: CaseTvaDTO) {
    Object.assign(this, dto || new CaseTvaDTO());
  }

  get getLibelleCase(): string {
    return `${this.numeroCase} - ${this.libelleCase}`;
  }
}
