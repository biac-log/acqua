export interface ICompteDeTier {
  type: string;
  numero: number;
  nom: string;
  codeDevise: number;
  libelleDevise: string;
  typeDevise: string;
  soldeComptable: number;
  delaiPaiementLibelle: string;
  escomptePourcentage: number;
  escompteNombreJours: number;
  compteAssocieNumero: number;
  compteAssocieNom: string;
  compteVenteAchatNumero: number;
  compteVenteAchatNom: string;
  codeTaxe: number;
}

export class CompteDeTierDTO implements ICompteDeTier {
  type = '';
  numero = 0;
  nom = '';
  codeDevise = 0;
  libelleDevise = '';
  typeDevise = '';
  soldeComptable = 0;
  delaiPaiementLibelle = '';
  escomptePourcentage = 0;
  escompteNombreJours = 0;
  compteAssocieNumero = 0;
  compteAssocieNom = '';
  compteVenteAchatNumero = 0;
  compteVenteAchatNom = '';
  codeTaxe = 0;
}

export class CompteDeTier extends CompteDeTierDTO {
  constructor(dto?: CompteDeTierDTO) {
    super();
    Object.assign(this, dto || new CompteDeTierDTO());
  }

  get libelleCompteAssocie(): string {
    return this.compteAssocieNumero ? `${this.compteAssocieNumero} ${this.compteAssocieNom}` : '';
  }

  get libelleCompteVenteAchat(): string {
    return this.compteVenteAchatNumero ? `${this.compteVenteAchatNumero} ${this.compteVenteAchatNom}` : '';
  }

  get libelleSoldeCompteTiers(): string {
    return `${this.soldeComptable.toDecimalString(2)} ${this.libelleDevise}`;
  }

  get numeroNom(): string {
    return `${this.numero ? this.numero : ''} ${this.nom}`.trim();
  }
}
