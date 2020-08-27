import { CaseTva } from '@/models/CaseTva';
import { Devise } from '@/models/Financier';

export interface IPieceComptableContrepartie {
  numeroLigne: number;
  typeCompte: string;
  numeroCompte: number;
  compteLibelle: string;
  libelle: string;
  codeMouvement: string;
  montantDevise: number;
  montantBase: number;
  codeDevise: number;
  caseTva: CaseTva;
  devise: Devise;
}

export class PieceComptableContrepartieDTO implements IPieceComptableContrepartie {
  public numeroLigne = 0;
  public typeCompte = '';
  public numeroCompte = 0;
  public compteLibelle = '';
  public libelle = '';
  public codeMouvement = '';
  public montantDevise = 0;
  public montantBase = 0;
  public codeDevise = 0;
  public caseTva: CaseTva = new CaseTva();
  public devise: Devise = new Devise();
  public dossier = '';
  public dossierNom = '';
}

export class PieceComptableContrepartie extends PieceComptableContrepartieDTO {
  constructor(dto?: PieceComptableContrepartieDTO) {
    super();
    this.refresh(dto);
    this.caseTva = new CaseTva(dto?.caseTva);
  }

  public refresh(dto?: PieceComptableContrepartieDTO) {
    Object.assign(this, dto || new PieceComptableContrepartieDTO());
  }

  get libelleNumero(): string {
    return `${this.typeCompte} ${this.numeroCompte}`;
  }

  get montantDebit(): string {
    return this.codeMouvement == 'DB' ? this.montantDevise.toDecimalString(2) : '';
  }

  get montantCredit(): string {
    return this.codeMouvement != 'DB' ? this.montantDevise.toDecimalString(2) : '';
  }

  get montantDebitBase(): string {
    return this.codeMouvement == 'DB' ? this.montantBase.toDecimalString(2) : '';
  }

  get montantCreditBase(): string {
    return this.codeMouvement != 'DB' ? this.montantBase.toDecimalString(2) : '';
  }

  get libelleCaseTva(): string {
    return this.caseTva.getLibelleCase;
  }

  get libelleDevise(): string {
    return this.devise?.libelle ? this.devise.libelle : '';
  }
}
