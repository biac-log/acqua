export class EcheancierElementDTO{
  numeroJournalPrincipal = 0;
  numeroPiecePrincipal = 0;
  numeroJournal = 0;
  numeroPiece = 0;
  typePiece = "";
  datePiece = "";
  montant = 0;
  libelleDevise = "";
  codeDevise = 0;
  libelle = "";
  dateEcheance = "";
  solde = 0;
  rappel = 0;
  echu = "";
}

export class EcheancierElement extends EcheancierElementDTO {
  constructor(dto?: EcheancierElementDTO){
    super();
    Object.assign(this, dto || new EcheancierElementDTO());
  }

  public isLastRow = false;
  public isFirstRow = true;

  get libellePiece(): string{
    return `${this.numeroJournal}.${this.numeroPiece}`;
  }

  get datePieceDate(): Date{
    return new Date(this.datePiece);
  }

  get dateEcheanceDate(): Date{
    return new Date(this.datePiece);
  }
}