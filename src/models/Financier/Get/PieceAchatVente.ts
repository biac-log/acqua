export class PieceAchatVenteDTO {
  public numeroJournal = 0;
  public numeroPiece = 0;
  public codeDevise = 0;
  public libelleDevise = '';
  public typeCompteTiers = '';
  public numeroCompteTiers = '';
  public nomCompteTiers = '';
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
