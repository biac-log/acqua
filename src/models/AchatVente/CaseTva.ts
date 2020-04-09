  export interface ICaseTva {
    numeroCase: number;
    libelleCase: string;
    natureCase: string;
    tauxTvaCase: number;
    typeCase: number;
    libelleTypeCase: string;
  }
  
  export class CaseTvaDTO implements ICaseTva{
    numeroCase: number = 0;
    libelleCase: string = "";
    natureCase: string = "";
    tauxTvaCase: number = 0;
    typeCase: number = 0;
    libelleTypeCase: string = "";
  }
  
  export class CaseTva extends CaseTvaDTO {
    constructor(dto?: CaseTvaDTO){
      super();
      Object.assign(this, dto || new CaseTvaDTO());
    }
  }