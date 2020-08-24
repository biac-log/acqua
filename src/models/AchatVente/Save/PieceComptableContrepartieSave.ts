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
  public typeCompte = '';
  public numeroCompte = 0;
  public codeDevise = 0;
  public codeMouvement = '';
  public montantDevise = 0;
  public montantBase = 0;
  public libelle = '';
  public numeroCaseTVA = 0;
  public numeroLigne = 0;
  public dossier = '';
}
