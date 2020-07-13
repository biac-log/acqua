import { CaseTva } from '@/models/CaseTva';

export class VentilationDTO{
  numeroVentilation = 0;
  typeCompte = "";
  numeroCompte = 0;
  nomCompte = "";
  referenceJournal = 0;
  referencePiece = 0;
  libelle = "";
  codeMouvement = "";
  montantDevise = 0;
  montantBase = 0;
  codeDevise = 0;
  libelleDevise = "";
  codeCaseTVA = 0;
  libelleCaseTVA = "";
  caseTva = new CaseTva();
}

export class Ventilation extends VentilationDTO {
  constructor(dto?: VentilationDTO){
    super();
    Object.assign(this, dto || new VentilationDTO());
    this.caseTva = new CaseTva(dto?.caseTva);
  }

  get libelleCompte(): string{
    return `${this.typeCompte} ${this.numeroCompte} ${this.nomCompte}`;
  }

  get libellePiece(): string{
    return this.referencePiece ? `${this.referenceJournal}.${this.referencePiece}` : "";
  }

  get montantDebit(): string{
    return this.codeMouvement == "DB" ? this.montantDevise.toDecimalString(2) : "";
  }

  get montantCredit(): string{
    return this.codeMouvement != "DB" ? this.montantDevise.toDecimalString(2) : "";
  }
}