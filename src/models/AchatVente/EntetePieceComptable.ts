export interface IEntetePieceComptable {
  codeJournal: number;
  codePiece: number
  escompte: number;
  libelle: string;
  datePiece: Date;
  dateEcheance: Date;
  status: number;
  statusLibelle:string;
  montant: number;
  numeroCompte: number;
  nomCompte: string;
  devise: string;
}

export class EntetePieceComptableDTO implements IEntetePieceComptable{
  codeJournal: number = 0;
  codePiece: number = 0;
  escompte: number = 0;
  libelle: string = '';
  datePiece: Date = new Date();
  dateEcheance: Date = new Date();
  status: number = 0;
  statusLibelle:string="";
  montant: number = 0;
  numeroCompte: number = 0;
  nomCompte: string = "";
  devise: string = "";
}

export class EntetePieceComptable extends EntetePieceComptableDTO {
  constructor(dto?: EntetePieceComptableDTO){
    super();
    Object.assign(this, dto || new EntetePieceComptableDTO());
  }

  get codePieceDisplay(): string{
    return `${this.codeJournal}.${this.codePiece}`;
  }

  get statutDisplay(): string{
    return `${this.status}.${this.statusLibelle}`;
  }
}