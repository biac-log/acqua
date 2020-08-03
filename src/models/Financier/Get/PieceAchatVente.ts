export class PieceAchatVenteDTO {
  public numeroJournal: number = 0;
  public numeroPiece: number = 0;
  public codeDevise: number = 0;
  public libelleDevise: string = "";
  public typeCompteTiers: string = "";
  public numeroCompteTiers: string = "";
  public nomCompteTiers = "";
  public montantTotalDv = 0;
  public montantTotalBase = 0;
  public montantAVentilerDv = 0;
  public montantAVentilerBase = 0;
}

export class PieceAchatVente extends PieceAchatVenteDTO {
  constructor(dto?: PieceAchatVenteDTO) {
    super();
    Object.assign(this, dto || new PieceAchatVenteDTO());
  }
}
