
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
  numeroCase: number = 0;
  libelleCase: string = "";
}
  
export default class CompteSearch extends CompteSearchDTO {
  constructor(dto: CompteSearchDTO){
    super();
    Object.assign(this, dto);
  }

  get fullName(): string {
    return `${this.numero} - ${this.nom}`;
  }

  get numeroNom(): string{
    return `${this.numero ? this.numero : ""} ${this.nom}`.trim();
  }

  get caseTvaDisplay(){
    return `${this.numeroCase ? this.numeroCase : ""} ${this.libelleCase? this.libelleCase : ""}`
  }
}