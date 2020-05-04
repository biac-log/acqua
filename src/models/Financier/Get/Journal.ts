
  import { Devise, DeviseDTO } from "./Devise";
import { CompteBanqueDTO } from './CompteBanque';
  
  export interface IJournal {
    numero: number;
    libelle: string;
    famille: string;
    codeDevise: string;
    devise: DeviseDTO;
    numeroDernierePiece: number;
    numeroCompteBanque: number,
    compteBanque: CompteBanqueDTO;
  }
  
  export class JournalDTO implements IJournal{
    numero: number = 0;
    libelle: string = "";
    famille: string = "";
    codeDevise: string = "";
    devise: DeviseDTO = new DeviseDTO();
    numeroDernierePiece: number = 0;
    numeroCompteBanque: number = 0;
    compteBanque: CompteBanqueDTO = new CompteBanqueDTO();
  }

  export class Journal extends JournalDTO {
    constructor(dto?: JournalDTO){
      super();
      Object.assign(this, dto || new JournalDTO());
    }
 
    get fullLibelle(): string {
      return `${this.numero} - ${this.libelle}`;
    }

    get typeCompteChar(): string {
      if (this.famille == "vente" || this.famille == "ncvente")
        return "C";
      else if (this.famille == "achat" || this.famille == "ncachat")
        return "F";
      else return "";
    }

    get codeMouvement(): string{
      return this.famille == "vente" || this.famille == "ncachat" ? "DB" : "CR";
    }
  }