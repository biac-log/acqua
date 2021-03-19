import { DateTime } from "../DateTime";

export class ImputationDetailDTO {
    date = new DateTime();
    codeJournal = 0;
    codePiece = 0;
    codeLigneExtrait = 0;
    codeLigneVentilation = 0;
    numeroCompte = 0;
    libellePiece = '';
    mouvementBase = 0;
    codeMouvement = '';
    caseBase = 0;
    refCodeJournal = 0;
    refCodePiece = 0;
}

export class ImputationDetail extends ImputationDetailDTO {
  constructor(dto?: ImputationDetailDTO) {
    super();
    Object.assign(this, dto || new ImputationDetailDTO());
  }

  get dateDisplay(): string {
    return this.date.toString('DD.MM.YYYY');
  }

  get pieceDesc() {
    return `${this.codeJournal}.${this.codePiece}/${this.codeLigneExtrait.padStart(2)} ${this.codeLigneVentilation.padStart(3)}`;
  }

  get reference() {
    return `${this.refCodeJournal}.${this.refCodePiece}`;
  }
}
