import { PieceComptableContrepartie } from '.';

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
  numeroCompte: number;
  codeMouvement: string;
  contreparties: PieceComptableContrepartie[];
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
  public numeroCompte: number = 0;
  public codeMouvement: string = "";
  public contreparties: PieceComptableContrepartie[] = [];
  public hash: string = "";
}

export class PieceComptableSave extends PieceComptableSaveDTO {
  constructor(dto?: PieceComptableSaveDTO) {
    super();
    Object.assign(this, dto || new PieceComptableSaveDTO());
    if (dto) {
      this.contreparties = [];
      dto.contreparties.forEach(element => {
        this.contreparties.push(new PieceComptableContrepartie(element));
      });
    }
  }
}
