import { DateTime } from '@/models/DateTime';

export class PeriodeComptableDTO {
  public libelle = '';
  public debut = '';
  public fin = '';
  public typePeriodeComptable = '';
}

export class PeriodeComptable extends PeriodeComptableDTO {
  constructor(dto?: PeriodeComptableDTO) {
    super();
    Object.assign(this, dto || new PeriodeComptableDTO());
  }

  get dateDebut(): DateTime {
    return new DateTime(this.debut);
  }
  set dateDebut(date: DateTime) {
    this.debut = date.toUtc();
  }

  get dateFin(): DateTime {
    return new DateTime(this.fin);
  }
  set dateFin(date: DateTime) {
    this.fin = date.toUtc();
  }

  get libellePeriode(): string {
    return this.debut ? `Début ${this.dateDebut} - Fin ${this.dateFin}` : '';
  }

  get libellePeriodeFull(): string {
    let stPeriode = 'Période courante';
    if (this.typePeriodeComptable == 'precedente') stPeriode = 'Période précédente';
    if (this.typePeriodeComptable == 'anneePrecedente') stPeriode = 'Année précédente';
    return `${stPeriode} du ${this.dateDebut} au ${this.dateFin}`;
  }
}
