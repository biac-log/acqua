export interface IPieceComptableContrepartieSave {
  typeCompte: string;
  numeroCompte: number;
  libelle: string;
  codeMouvement: string;
  montantDevise: number;
  montantBase: number;
  codeDevise: number;
  numeroCaseTVA: number;
}

export class PieceComptableContrepartieSaveDTO implements IPieceComptableContrepartieSave {
  public typeCompte: string = "";
  public numeroCompte: number = 0;
  public codeDevise: number = 0;
  public codeMouvement: string = "";
  public montantDevise: number = 0;
  public montantBase: number = 0;
  public libelle: string = "";
  public numeroCaseTVA: number = 0;
  public numeroLigne:number=0;
}
