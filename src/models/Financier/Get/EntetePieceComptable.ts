import { DateTime } from '@/models/DateTime';

export interface IEntetePieceComptable {
  numeroJournal: number;
  numeroPiece: number;
  soldeInitiale: number;
  totalDebit: number;
  totalCredit: number;
  soldeFinale: number;
  pieceEquilibree: boolean;
  libelleDevise: string;
  datePiece: string;
  libelle: string;
}

export class EntetePieceComptableDTO implements IEntetePieceComptable {
  numeroJournal = 0;
  numeroPiece = 0;
  soldeInitiale = 0;
  totalDebit = 0;
  totalCredit = 0;
  soldeFinale = 0;
  pieceEquilibree = false;
  libelleDevise = '';
  datePiece = '';
  libelle = '';
}

export class EntetePieceComptable extends EntetePieceComptableDTO {
  constructor(dto?: EntetePieceComptableDTO) {
    super();
    Object.assign(this, dto || new EntetePieceComptableDTO());
  }

  get codePieceDisplay(): string {
    return `${this.numeroJournal}.${this.numeroPiece}`;
  }

  private _datePieceDate?: DateTime;
  get datePieceDate(): DateTime {
    if (!this._datePieceDate) this._datePieceDate = new DateTime(this.datePiece);
    return this._datePieceDate;
  }
  set datePieceDate(date: DateTime) {
    this._datePieceDate = date;
    this.datePiece = date.toUtc();
  }
}
