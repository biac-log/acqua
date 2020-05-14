export interface ICompteDeTier {
  type: string;
  numero: number;
  nom: string;
  codeDevise: number;
  libelleDevise: string;
  typeDevise: string;
  soldeComptable: number;
  delaiPaiementLibelle: string,
  escomptePourcentage: number;
  escompteNombreJours: number;
  compteAssocieNumero: number;
  compteAssocieNom: string;
  compteVenteAchatNumero: number;
  compteVenteAchatNom: string;
  codeTaxe: number;
}
  
export class CompteDeTierDTO implements ICompteDeTier{
  type: string = "";
  numero: number = 0;
  nom: string = "";
  codeDevise: number = 0;
  libelleDevise: string = "";
  typeDevise: string = "";
  soldeComptable: number = 0;
  delaiPaiementLibelle: string = "";
  escomptePourcentage: number = 0;
  escompteNombreJours: number = 0;
  compteAssocieNumero: number = 0;
  compteAssocieNom: string = "";
  compteVenteAchatNumero: number = 0;
  compteVenteAchatNom: string= "";
  codeTaxe: number = 0;
}
  
export class CompteDeTier extends CompteDeTierDTO {
  constructor(dto: CompteDeTierDTO){
    super();
    Object.assign(this, dto);
  }

  get libelleCompteAssocie(): string{
    return `${this.compteAssocieNumero} ${this.compteAssocieNom}`;
  }

  get libelleCompteVenteAchat(): string{
    return !!this.compteVenteAchatNumero ? `${this.compteVenteAchatNumero} ${this.compteVenteAchatNom}` : "";
  }

  get libelleSoldeCompteTiers(): string{
    return `${this.soldeComptable.toDecimalString(2)} ${this.libelleDevise}`;
  }
}