import { Ventilation, VentilationDTO } from "./Ventilation";

export class ExtraitDTO {
  numeroExtrait = 0;
  typeCompte = "";
  numeroCompte = 0;
  nomCompte = "";
  montantBase = 0;
  montantDevise = 0;
  codeMouvement = "";
  codeDevise = 0;
  libelleDevise = "";
  codeReglement = 0;
  libelleReglement = "";
  ventilations: Ventilation[] = [];
}

export class Extrait extends ExtraitDTO {
  constructor(dto?: ExtraitDTO) {
    super();
    Object.assign(this, dto || new ExtraitDTO());
    this.ventilations = dto?.ventilations.map(v => new Ventilation(v)) || [];
  }

  get libelleCompte(): string {
    return `${this.typeCompte} ${this.numeroCompte}`;
  }

  get montantDebit(): string {
    return this.codeMouvement == "DB" ? this.montantDevise.toDecimalString(2) : "";
  }

  get montantCredit(): string {
    return this.codeMouvement == "CR" ? this.montantDevise.toDecimalString(2) : "";
  }

  get montantBaseSigned(): string {
    return this.codeMouvement == "CR"
      ? (this.montantBase * -1).toDecimalString(2)
      : this.montantBase.toDecimalString(2);
  }

  get montantDeviseSigned(): string {
    return this.codeMouvement == "CR"
      ? (this.montantDevise * -1).toDecimalString(2)
      : this.montantDevise.toDecimalString(2);
  }
}
