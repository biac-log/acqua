import { DateTime } from '../DateTime';
import { Imputation } from './Imputation';

export class PieceComptableDTO {
  numeroJournal = 0;
  numeroPiece = 0;
  codeDeviseJournal = 0;
  libelleDeviseJournal = '';
  datePiece = '';
  imputations: Imputation[] = [];
  hash = '';
}

export class PieceComptable extends PieceComptableDTO {
  constructor(dto?: PieceComptableDTO) {
    super();
    Object.assign(this, dto || new PieceComptableDTO());
    this.imputations = dto?.imputations.map((v) => new Imputation(v)) || [];
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
