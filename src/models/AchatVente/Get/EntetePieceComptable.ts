import moment from 'moment'
import { DateTime } from '@/models/DateTime';

export interface IEntetePieceComptable {
  codeJournal: number;
  codePiece: number
  escompte: number;
  libelle: string;
  datePiece: string;
  dateEcheance: string;
  status: number;
  statusLibelle:string;
  montant: number;
  numeroCompte: number;
  nomCompte: string;
  devise: string;
  isEquilibre: boolean;
}

export class EntetePieceComptableDTO implements IEntetePieceComptable{
  codeJournal: number = 0;
  codePiece: number = 0;
  escompte: number = 0;
  libelle: string = '';
  datePiece: string = "";
  dateEcheance: string = "";
  status: number = 0;
  statusLibelle:string="";
  montant: number = 0;
  numeroCompte: number = 0;
  nomCompte: string = "";
  devise: string = "";
  isEquilibre: boolean = true;
}

export class EntetePieceComptable extends EntetePieceComptableDTO {
  constructor(dto?: EntetePieceComptableDTO){
    super();
    Object.assign(this, dto || new EntetePieceComptableDTO());
  }

  get codePieceDisplay(): string{
    return `${this.codeJournal}.${this.codePiece}`;
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

  private _dateEcheanceDate?: DateTime;
  get dateEcheanceDate(): DateTime{
    if(!this._dateEcheanceDate) this._dateEcheanceDate = new DateTime(this.dateEcheance);
    return this._dateEcheanceDate;
  }
  set dateEcheanceDate(date: DateTime){
    this._dateEcheanceDate = date;
    this.dateEcheance = date.toUtc();
  }

  get escompteDisplay(){
    return this.escompte ? this.escompte : "";
  }
}