import { PieceComptableContrepartie, PieceComptableContrepartieSaveDTO } from '..';

export interface IPieceComptableSave {
  periode: string;
  numeroJournal: number;
  numeroPiece: number;
  datePiece: string;
  dateEcheance: string;
  montantDevise: number;
  montantBase: number;
  codeDevise: number;
  libelle: string;
  typeCompte: string;
  montantEscompteBase: number;
  montantEscompteDevise: number;
  numeroCompte: number;
  numeroCompteAssocie: number;
  codeBlocage: number;
  pieceAcquittee: boolean;
  codeMouvement: string;
  contreparties: PieceComptableContrepartieSaveDTO[];
  hash: string;
}

export class PieceComptableSaveDTO implements IPieceComptableSave {
  public periode = '';
  public numeroJournal = 0;
  public numeroPiece = 0;
  public datePiece = '';
  public dateEcheance = '';
  public montantDevise = 0;
  public montantBase = 0;
  public codeDevise = 0;
  public libelle = '';
  public typeCompte = '';
  public numeroCompte = 0;
  public montantEscompteBase = 0;
  public montantEscompteDevise = 0;
  public codeMouvement = '';
  public numeroCompteAssocie = 0;
  public codeBlocage = 0;
  public pieceAcquittee = false;
  public contreparties: PieceComptableContrepartieSaveDTO[] = [];
  public hash = '';
}
