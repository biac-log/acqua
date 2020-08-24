import { DateTime } from '@/models/DateTime';

export interface IEntetePieceComptable {
  codeJournal: number;
  codePiece: number;
  escompte: number;
  libelle: string;
  datePiece: string;
  dateEcheance: string;
  status: number;
  statusLibelle: string;
  montant: number;
  numeroCompte: number;
  nomCompte: string;
  devise: string;
  isEquilibre: boolean;
}

export class EntetePieceComptableDTO implements IEntetePieceComptable {
  codeJournal = 0;
  codePiece = 0;
  escompte = 0;
  libelle = '';
  datePiece = '';
  dateEcheance = '';
  status = 0;
  statusLibelle = '';
  montant = 0;
  numeroCompte = 0;
  nomCompte = '';
  devise = '';
  isEquilibre = true;
}

export class EntetePieceComptable extends EntetePieceComptableDTO {
  constructor(dto?: EntetePieceComptableDTO) {
    super();
    Object.assign(this, dto || new EntetePieceComptableDTO());
  }

  get codePieceDisplay(): string {
    return `${this.codeJournal}.${this.codePiece}`;
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

  private _dateEcheanceDate?: DateTime;
  get dateEcheanceDate(): DateTime {
    if (!this._dateEcheanceDate) this._dateEcheanceDate = new DateTime(this.dateEcheance);
    return this._dateEcheanceDate;
  }
  set dateEcheanceDate(date: DateTime) {
    this._dateEcheanceDate = date;
    this.dateEcheance = date.toUtc();
  }

  get escompteDisplay() {
    return this.escompte ? this.escompte : '';
  }
}
