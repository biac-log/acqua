
export interface ICompteSearch {
    numero: number;
    nom: string;
    raisonSocial: string;
    adresse: string;
  }
  
  export class CompteSearchDTO implements ICompteSearch{
    numero: number = 0;
    nom: string = "";
    raisonSocial: string ="";
    adresse: string = "";
  }
  
  export default class CompteSearch extends CompteSearchDTO {
    constructor(dto: CompteSearch){
      super();
      Object.assign(this, dto);
    }
  
    get fullName(): string {
      return `${this.numero} - ${this.nom}`;
    }
  }