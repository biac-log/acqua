export class EcheancierElementDTO {
  numeroJournalPrincipal = 0;
  numeroPiecePrincipal = 0;
  numeroJournal = 0;
  numeroPiece = 0;
  typePiece = '';
  datePiece = '';
  libelleDevise = '';
  codeDevise = 0;
  libelle = '';
  dateEcheance = '';
  rappel = 0;
  soldeDevise = 0;
  soldeBase = 0;
  montantDevise = 0;
  montantBase = 0;
  codeBlocage = 0;
  libelleCodeBlocage = '';
}

export class EcheancierElement extends EcheancierElementDTO {
  constructor(dto?: EcheancierElementDTO) {
    super();
    Object.assign(this, dto || new EcheancierElementDTO());
  }

  public isLastRow = false;

  get libellePiece(): string {
    return `${this.numeroJournal}.${this.numeroPiece}`;
  }

  get datePieceDate(): Date {
    return new Date(this.datePiece);
  }

  get dateEcheanceDate(): Date {
    return new Date(this.datePiece);
  }

  get isPiecePrincipale(): boolean {
    return this.numeroPiecePrincipal == this.numeroPiece;
  }

  get isSolde(): boolean {
    return this.soldeBase == 0 && this.soldeDevise == 0;
  }

  get codeBlocageDisplay(): string {
    return this.codeBlocage ? `${this.codeBlocage} ${this.libelleCodeBlocage}` : '';
  }
}
