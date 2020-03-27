export class EntetePieceComptable {
    public codeJournal: number = 0;
    public codePiece: number = 0;
    public escompte: number = 0;
    public libelle: string = '';
    public datePiece: Date = new Date();
    public dateEcheance: Date = new Date();
    public status: number = 0;
    public montant: number = 0;
    public numeroCompte: number = 0;
    public nomCompte: string = "";
    public devise: string = "";
  }
  export class Journal {
    public numero: number = 0;
    public libelle: string = '';
    public isAutomatique: boolean = false;
    public famille: string = '';
    public devise: string = '';
    public numeroDernierePiece: number = 0;
  }

  export class PeriodeComptable {
    public debut: Date = new Date();
    public fin: Date = new Date();
    public typePeriodeComptable: string = '';
  }