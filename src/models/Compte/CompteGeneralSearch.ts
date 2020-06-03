
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
  
export class CompteGeneralSearchDTO implements ICompteGeneralSearch{
    type: string = "";
    numero: number = 0;
    nom: string = "";
    solde: number = 0;
    nature: string = "";
    libelleNature: string = "";
    numeroCase: number = 0;
    libelleCase: string = "";
}

export default class CompteGenerealSearch extends CompteGeneralSearchDTO {
  constructor(dto: CompteGeneralSearchDTO){
    super();
    Object.assign(this, dto);
  }

  get libelleSolde(){
    return this.solde.toDecimalString(2);
  }

  get numeroNom(){
    return `${this.numero} ${this.nom}`;
  }

  get caseTvaDisplay(){
    return `${this.numeroCase ? this.numeroCase : ""} ${this.libelleCase? this.libelleCase : ""}`
  }
}