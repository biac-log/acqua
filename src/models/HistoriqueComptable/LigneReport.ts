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
      return this.solde.toComptaString(2, true);
  }
  get soldeCumuleCompta() {
      return this.soldeCumule.toComptaString(2, true);
  }
  get debitCompta() {
      return this.debit.toComptaString(2, true);
  }
  get debitCumuleCompta() {
      return this.debitCumule.toComptaString(2, true);
  }
  get creditCompta() {
      return this.credit.toComptaString(2, true);
  }
  get creditCumuleCompta() {
      return this.creditCumule.toComptaString(2, true);
  }
}
