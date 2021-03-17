import moment from 'moment';
import { DateTime } from '../DateTime';

export class ImputationDTO {
  typeCompte = '';
  numeroCompte = 0;
  numeroPiece = 0;
  codeLigneExtrait = 0;
  codeLigneVentilation = 0;
  libellePiece = '';
  codeMouvement = 0;
  libelleDevise = '';
  date = '';
  codeJournal = 0;
  mouvementBase = 0;
  chiffreDAffaire = 0;
  cumulTva = 0;
  referenceJournal = 0;
  referencePiece = 0;
  codeOperation = 0;
  abbrCodeOperation = '';
}

export class Imputation extends ImputationDTO {
  constructor(dto?: ImputationDTO) {
    super();
    Object.assign(this, dto || new ImputationDTO());
  }

  get pieceDesc(): string {
    return `${this.abbrCodeOperation}${this.codeJournal}.${this.numeroPiece}`;
  }

  get dateDisplay(): string {
    return new DateTime(this.date).toString('DD.MM.YYYY');
  }

  get caseRef(): string {
    if (!this.referenceJournal && !this.referencePiece) return '';
    else return `${this.referenceJournal}.${this.referencePiece}`;
  }

  get lien(): string {
    return `${this.codeLigneExtrait.padStart(2)}/${this.codeLigneVentilation.padStart(3)}`;
  }

  get chiffreAffaire() {
    return this.chiffreDAffaire.toComptaString();
  }

  get mouvement() {
    return this.mouvementBase.toComptaString();
  }
}
