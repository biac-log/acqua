  export interface ICompteBanque {
    type: string;
    numero: number;
    nom: string;
    solde: number;
    nature: string;
    libelleNature: string;
    numeroCase: number;
    libelleCase: string;
  }
  
  export class CompteBanqueDTO implements ICompteBanque{
    type: string = "";
    numero: number = 0;
    nom: string = "";
    solde: number = 0;
    nature: string = "";
    libelleNature: string = "";
    numeroCase: number = 0;
    libelleCase: string = "";
  }
  
  export class CompteBanque extends CompteBanqueDTO {
    constructor(dto?: CompteBanqueDTO){
      super();
      Object.assign(this, dto || new CompteBanqueDTO());
    }
  }