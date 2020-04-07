
  export interface IJournal {
    numero: number;
    libelle: string;
    isAutomatique: boolean;
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
  }