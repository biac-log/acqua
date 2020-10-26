import { CaseTvaDTO } from '../CaseTva';
import { DateTime } from '../DateTime';

export class ImputationDTO {
  numeroVentilation = 0;
  typeCompte = '';
  numeroCompte = 0;
  nomCompte = '';
  natureCompte = '';
  dossier = '';
  dossierNom = '';
  referenceJournal = 0;
  referencePiece = 0;
  libelle = '';
  codeMouvement = '';
  montantDevise = 0;
  montantBase = 0;
  codeDevise = 0;
  libelleDevise = '';
  codeCaseTVA = 0;
  libelleCaseTVA = '';
  dateEcheance = '';
  caseTva: CaseTvaDTO = new CaseTvaDTO();
  operationNumero = 0;
  operationLibelle = '';
  chida = 0;
  escompte = 0;
  escompteDevise = 0;
  montantTVA = 0;
}

export class Imputation extends ImputationDTO {
  constructor(dto?: ImputationDTO) {
    super();
    Object.assign(this, dto || new ImputationDTO());
  }

  get libelleCompte() {
    return `${this.numeroCompte} ${this.nomCompte}`;
  }

  get libelleReference() {
    return this.referencePiece ? `${this.referenceJournal.toString().padStart(2, '0')}.${this.referencePiece}` : '';
  }

  get debit() {
    return this.codeMouvement == 'DB' ? this.montantBase : 0;
  }

  get credit() {
    return this.codeMouvement == 'CR' ? this.montantBase : 0;
  }

  get dateEcheanceDate(): DateTime | null {
    return new DateTime(this.dateEcheance);
  }
  set dateEcheanceDate(date: DateTime | null) {
    this.dateEcheance = date ? date.toJsonDateTime() : '';
  }
}
