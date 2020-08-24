import { Ventilation, VentilationDTO } from './Ventilation';
import _ from 'lodash';
export class ExtraitDTO {
  numeroExtrait = 0;
  typeCompte = '';
  numeroCompte = 0;
  nomCompte = '';
  montantBase = 0;
  montantDevise = 0;
  codeMouvement = '';
  codeDevise = 0;
  libelleDevise = '';
  codeReglement = 0;
  libelleReglement = '';
  ventilations: Ventilation[] = [];
}

export class Extrait extends ExtraitDTO {
  constructor(dto?: ExtraitDTO) {
    super();
    Object.assign(this, dto || new ExtraitDTO());
    this.ventilations = dto?.ventilations.map((v) => new Ventilation(v)) || [];
  }

  get libelleCompte(): string {
    return `${this.typeCompte} ${this.numeroCompte}`;
  }

  get montantDebit(): string {
    return this.codeMouvement == 'DB' ? this.montantDevise.toDecimalString(2) : '';
  }

  get montantCredit(): string {
    return this.codeMouvement == 'CR' ? this.montantDevise.toDecimalString(2) : '';
  }

  get montantBaseSigned(): string {
    return this.codeMouvement == 'CR'
      ? (this.montantBase * -1).toDecimalString(2)
      : this.montantBase.toDecimalString(2);
  }

  get montantDeviseSigned(): string {
    return this.codeMouvement == 'CR'
      ? (this.montantDevise * -1).toDecimalString(2)
      : this.montantDevise.toDecimalString(2);
  }

  get isEquilibre(): boolean {
    const debitVent = _.round(_.sum(this.ventilations.map((m) => m.montantDebit.toNumber())), 2);
    const creditVent = _.round(_.sum(this.ventilations.map((m) => m.montantCredit.toNumber())), 2);
    if (this.montantCredit) {
      const aVentille = _.round(this.montantCredit.toNumber() - debitVent + creditVent, 2);
      return aVentille == 0;
    } else {
      const aVentille = _.round(this.montantDebit.toNumber() - creditVent + debitVent, 2);
      return aVentille == 0;
    }
  }
}
