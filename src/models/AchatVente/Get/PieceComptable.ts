import { IPieceComptableContrepartie, PieceComptableContrepartie } from './PieceComptableContrepartie';
import moment from 'moment';
export interface IPieceComptable {
  numeroJournal: number;
  numeroPiece: number;
  codeDevise: number;
  libelleDevise: string;
  libelle: string;
  taux: number;
  montantDevise: number;
  montantBase: number;
  datePiece: string;
  dateEcheance: string;
  montantEscompteDevise: number;
  montantEscompteBase: number;
  pieceAcquittee: boolean;
  statut: number;
  statutLibelle: string;
  compteTiersCodeDevise: number;
  compteTiersLibelleDevise: string;
  compteTiersNumero: number;
  compteTiersNom: string;
  compteTiersSoldeComptable: number;
  delaiPaiementLibelle: string;
  compteTiersEscomptePourcentage: string;
  compteTiersEscompteNombreJours: string;
  compteAssocieNumero: number;
  compteAssocieNom: string;
  compteVenteAchatNumero: number;
  compteVenteAchatNom: string;
  deviseComptaLibelle: string;
  hash: string;
  contreparties: IPieceComptableContrepartie[];
}

export class PieceComptableDTO implements IPieceComptable {
  public numeroJournal = 0;
  public numeroPiece = 0;
  public codeDevise = 0;
  public libelleDevise = '';
  public libelle = '';
  public taux = 0;
  public montantDevise = 0;
  public montantBase = 0;
  public datePiece = '';
  public dateEcheance = '';
  public montantEscompteDevise = 0;
  public montantEscompteBase = 0;
  public pieceAcquittee = false;
  public statut = 0;
  public statutLibelle = '';
  public compteTiersCodeDevise = 0;
  public compteTiersLibelleDevise = '';
  public compteTiersNumero = 0;
  public compteTiersNom = '';
  public compteTiersSoldeComptable = 0;
  public compteTiersCodeTaxe = 0;
  public delaiPaiementLibelle = '';
  public compteTiersEscomptePourcentage = '';
  public compteTiersEscompteNombreJours = '';
  public compteAssocieNumero = 0;
  public compteAssocieNom = '';
  public compteVenteAchatNumero = 0;
  public compteVenteAchatNom = '';
  public deviseComptaLibelle = '';
  public hash = '';
  public contreparties: PieceComptableContrepartie[] = [];
}

export class PieceComptable extends PieceComptableDTO {
  constructor(dto?: PieceComptableDTO) {
    super();
    Object.assign(this, dto || new PieceComptableDTO());
    if (dto) {
      this.contreparties = [];
      dto.contreparties.forEach((element) => {
        this.contreparties.push(new PieceComptableContrepartie(element));
      });
    }
  }

  get libelleStatut(): string {
    return `${this.statut} ${this.statutLibelle}`;
  }

  get libelleMontantBase(): string {
    return `${this.montantBase.toDecimalString(2)} ${this.deviseComptaLibelle}`;
  }

  get stringMontantBase(): string {
    return `${this.montantBase.toDecimalString(2)} ${this.deviseComptaLibelle}`;
  }

  get libelleCompteAssocie(): string {
    return `${this.compteAssocieNumero} ${this.compteAssocieNom}`;
  }

  get libelleCompteVenteAchat(): string {
    return `${this.compteVenteAchatNumero} ${this.compteVenteAchatNom}`;
  }

  get libelleSoldeCompteTiers(): string {
    return `${this.compteTiersSoldeComptable.toDecimalString(2)} ${this.compteTiersLibelleDevise}`;
  }

  get datePieceDate(): Date {
    return moment(this.datePiece).toDate();
  }
  set datePieceDate(date: Date) {
    this.datePiece = date.toISOString();
  }

  get dateEcheanceDate(): Date {
    return moment(this.dateEcheance).toDate();
  }
  set dateEcheanceDate(date: Date) {
    this.dateEcheance = date.toISOString();
  }
}
