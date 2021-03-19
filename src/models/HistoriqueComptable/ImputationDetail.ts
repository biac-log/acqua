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
}
