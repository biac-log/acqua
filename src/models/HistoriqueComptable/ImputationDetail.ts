import { DateTime } from "../DateTime";

export class ImputationDetailDTO {
    date = '';
    codeJournal = 0;
    codePiece = 0;
    codeLigneExtrait = 0;
    codeLigneVentilation = 0;
    numeroCompte = 0;
    libellePiece = '';
    mouvementBase = 0;
    codeMouvement = '';
    numeroCase = 0;
    libelleCase = '';
    refCodeJournal = 0;
    refCodePiece = 0;
    libelleDevise = '';
}

export class ImputationDetail extends ImputationDetailDTO {
  constructor(dto?: ImputationDetailDTO) {
    super();
    Object.assign(this, dto || new ImputationDetailDTO());
  }

  get dateDisplay(): string {
    return new DateTime(this.date).toString('DD.MM.YYYY');
  }

  get pieceDescEntete() {
    return `${this.codeJournal}.${this.codePiece}/${this.codeLigneExtrait.padStart(2)} ${this.codeLigneVentilation.padStart(3)}`;
  }
  
  get pieceDesc() {
    return `${this.codeLigneExtrait.padStart(2)} ${this.codeLigneVentilation.padStart(3)}`;
  }

  get reference() {
    if (!this.refCodeJournal && !this.refCodePiece && !this.libelleCase) return '';
    else if(this.libelleCase) return this.libelleCase;
    else return `${this.refCodeJournal}.${this.refCodePiece}`;
  }

  get mouvement() {
    return this.mouvementBase.toComptaString();
  }

  get case() {
    if(!this.numeroCase) return '';
    else return this.numeroCase.padStart(3);
  }
}
