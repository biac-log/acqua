import { DateTime } from "../DateTime";
  
  export class ImputationDTO {
    typeCompte = '';
    numeroCompte = 0;
    numeroPiece = 0;
    codeLigneExtrait = 0;
    codeLigneVentilation = 0;
    libellePiece = '';
    codeMouvement = 0;
    libelleDevise = '';
    date: DateTime = new DateTime();
    codeJournal = 0;
    mouvementBase = 0;
    chiffreDAffaire = 0;
    referenceJournal = 0;
    referencePiece = 0;
  }
  
  export class Imputation extends ImputationDTO {
    constructor(dto?: ImputationDTO) {
      super();
      Object.assign(this, dto || new ImputationDTO());
    }
  }
  