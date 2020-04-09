export interface IPieceComptableContrepartie {
  numeroLigne:number;
  typeCompte: string;
  numeroCompte:number;
  compteLibelle: string;
  libelle: string;
  codeMouvement: string;
  montantDevise:number;
  montantBase:number;
  codeDevise:number;
  libelleDevise: string;
  numeroCase:number
  libelleCase: string;
}

export class PieceComptableContrepartieDTO implements IPieceComptableContrepartie{
  public numeroLigne:number=0;
  public typeCompte: string="";
  public numeroCompte:number=0;
  public compteLibelle: string="";
  public libelle: string="";
  public codeMouvement: string="";
  public montantDevise:number=0;
  public montantBase:number=0;
  public codeDevise:number=0;
  public libelleDevise: string="";
  public numeroCase:number=0;
  public libelleCase: string="";
}

export class PieceComptableContrepartie extends PieceComptableContrepartieDTO {
  constructor(dto?: PieceComptableContrepartieDTO){
    super();
    this.Refresh(dto);
  }

  public Refresh(dto?: PieceComptableContrepartieDTO){
    Object.assign(this, dto || new PieceComptableContrepartieDTO());
  }

  get libelleNumero(): string{
    return `${this.typeCompte}${this.numeroCompte}`;
  }

  get montantDebit(): string{
    return this.codeMouvement == "DB" ? this.montantBase.toFixed(2) : "";
  }

  get montantCredit(): string{
    return this.codeMouvement != "DB" ? this.montantBase.toFixed(2) : "";
  }

  get libelleCaseTva():string{
    return `${this.numeroCase} - ${ this.libelleCase }`;
  }
}