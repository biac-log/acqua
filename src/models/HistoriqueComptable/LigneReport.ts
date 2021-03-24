export class LigneReportDTO {
    periode = '';
    solde = 0;
    debit = 0;
    debitCumule = 0;
    credit = 0;
    creditCumule = 0;
    soldeCumule = 0;
}

export class LigneReport extends LigneReportDTO {
  constructor(dto?: LigneReportDTO) {
    super();
    Object.assign(this, dto || new LigneReportDTO());
  }

  get soldeCompta() {
      return this.solde.toComptaString();
  }
  get soldeCumuleCompta() {
      return this.soldeCumule.toComptaString();
  }
  get debitCompta() {
      return this.debit.toComptaString();
  }
  get debitCumuleCompta() {
      return this.debitCumule.toComptaString();
  }
  get creditCompta() {
      return this.credit.toComptaString();
  }
  get creditCumuleCompta() {
      return this.creditCumule.toComptaString();
  }
}
