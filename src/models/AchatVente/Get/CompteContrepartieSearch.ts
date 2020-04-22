
export interface ICompteContrepartieSearch {
  numero: number;
  nom: string;
  solde: number;
  nature: string;
  caseTva: string;
}
  
export class CompteContrepartieSearchDTO implements ICompteContrepartieSearch{
  numero: number = 0;
  nom: string = "";
  solde: number = 0;
  nature: string = "";
  caseTva: string = "";
}
  
export class CompteContrepartieSearch extends CompteContrepartieSearchDTO {
  constructor(dto: CompteContrepartieSearchDTO){
    super();
    Object.assign(this, dto);
  }
}