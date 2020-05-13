import { Extrait } from './Extrait';
import moment from 'moment';

export class PieceDTO {
  numeroJournal= 0;
  numeroPiece= 0;
  numeroCompteFinancier= 0;
  nomCompteFinancier= "";
  codeDeviseJournal= 0;
  libelleDeviseJournal= "";
  datePiece= "";
  soldeInitial= 0;
  extraits: Extrait[] = []
  hash = ""
}

export class Piece extends PieceDTO {
  constructor(dto?: PieceDTO){
    super();
    Object.assign(this, dto || new PieceDTO());
    this.extraits =  dto?.extraits.map(e => new Extrait(e)) || [];
  }

  get datePieceDate(): Date {
    return moment(this.datePiece).toDate();
  }
  set datePieceDate(date: Date) {
    this.datePiece = date.toISOString();
  }
}