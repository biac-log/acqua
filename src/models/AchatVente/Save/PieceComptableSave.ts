import { PieceComptableContrepartie, PieceComptableContrepartieSaveDTO } from '..';

export interface IPieceComptableSave {
  periode: string;
  numeroJournal: number;
  numeroPiece: number;
  datePiece: Date;
  dateEcheance: Date;
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
  public periode: string = "";
  public numeroJournal: number = 0;
  public numeroPiece: number = 0;
  public datePiece: Date = new Date();
  public dateEcheance: Date = new Date();
  public montantDevise: number = 0;
  public montantBase: number = 0;
  public codeDevise: number = 0;
  public libelle: string = "";
  public typeCompte: string = "";
  public numeroCompte: number = 0;
  public montantEscompteBase: number = 0;
  public montantEscompteDevise: number = 0
  public codeMouvement: string = "";
  public numeroCompteAssocie: number = 0;
  public codeBlocage: number = 0;
  public pieceAcquittee: boolean= false;
  public contreparties: PieceComptableContrepartieSaveDTO[] = [];
  public hash: string = "";
}