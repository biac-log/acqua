
  export interface IJournal {
    numero: number;
    libelle: string;
    famille: string;
    devise: string;
    numeroDernierePiece: number;
  }
  
  export class JournalDTO implements IJournal{
    numero: number = 0;
    libelle: string = "";
    isAutomatique: boolean = false;
    famille: string = "";
    devise: string = "";
    numeroDernierePiece: number = 0;
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