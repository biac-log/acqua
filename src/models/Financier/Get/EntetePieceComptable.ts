import { DateTime } from '@/models/DateTime';

export interface IEntetePieceComptable {
  numeroJournal: number;
  numeroPiece: number
  soldeInitiale: number;
  totalDebit: number;
  totalCredit: number;
  soldeFinale: number;
  pieceEquilibree: boolean;
  libelleDevise:string;
  datePiece: string;
  libelle: string;
}

export class EntetePieceComptableDTO implements IEntetePieceComptable{
  numeroJournal: number = 0;
  numeroPiece: number = 0;
  soldeInitiale: number = 0;
  totalDebit: number = 0;
  totalCredit: number = 0;
  soldeFinale: number = 0;
  pieceEquilibree: boolean = false;
  libelleDevise:string = "";
  datePiece: string = "";
  libelle: string = "";
}

export class EntetePieceComptable extends EntetePieceComptableDTO {
  constructor(dto?: EntetePieceComptableDTO){
    super();
    Object.assign(this, dto || new EntetePieceComptableDTO());
  }

  get codePieceDisplay(): string{
    return `${this.numeroJournal}.${this.numeroPiece}`;
  }

  private _datePieceDate?: DateTime;
  get datePieceDate(): DateTime{
    if(!this._datePieceDate) this._datePieceDate = new DateTime(this.datePiece);
    return this._datePieceDate;
  }
  set datePieceDate(date: DateTime){
    this._datePieceDate = date;
    this.datePiece = date.toUtc();
  }
}