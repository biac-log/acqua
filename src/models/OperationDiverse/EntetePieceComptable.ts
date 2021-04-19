import { DateTime } from '../DateTime';

export class EntetePieceComptableDTO {
  numeroJournal = 0;
  numeroPiece = 0;
  datePiece = '';
  montantDebit = 0;
  montantCredit = 0;
  isEquilibre = false;
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
