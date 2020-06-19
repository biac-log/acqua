  export interface ICaseTva {
    numeroCase: number;
    libelleCase: string;
    natureCase: string;
    tauxTvaCase: number;
    typeCase: number;
    libelleTypeCase: string;
    codePays: string;
  }
  
  export class CaseTvaDTO implements ICaseTva{
    numeroCase: number = 0;
    libelleCase: string = "";
    natureCase: string = "";
    tauxTvaCase: number = 0;
    typeCase: number = 0;
    libelleTypeCase: string = "";
    codePays: string = "";
  }
  
  export class CaseTva extends CaseTvaDTO {
    constructor(dto?: CaseTvaDTO){
      super();
      Object.assign(this, dto || new CaseTvaDTO());
    }

    public Refresh(dto?: CaseTvaDTO){
      Object.assign(this, dto || new CaseTvaDTO());
    }

    get getLibelleCase() : string{
      return `${this.numeroCase} - ${ this.libelleCase }`;
    }
  }