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
    return this.codeMouvement == "DB" ? this.montantDevise.toFixed(2) : "";
  }

  get montantCredit(): string {
    return this.codeMouvement != "DB" ? this.montantDevise.toFixed(2) : "";
  }

  get montantBaseSigned(): string {
    return this.codeMouvement == "DB"
      ? (this.montantBase * -1).toFixed(2)
      : this.montantBase.toFixed(2);
  }

  get montantDeviseSigned(): string {
    return this.codeMouvement != "DB"
      ? (this.montantDevise * -1).toFixed(2)
      : this.montantDevise.toFixed(2);
  }
}
