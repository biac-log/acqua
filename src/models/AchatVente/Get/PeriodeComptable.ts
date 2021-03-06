import { DateTime } from '@/models/DateTime';

export interface IPeriodeComptable {
  debut: string;
  fin: string;
  typePeriodeComptable: string;
}

export class PeriodeComptableDTO implements IPeriodeComptable {
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
    if (!this.debut) return '';
    return `Début ${this.dateDebut} - Fin ${this.dateFin}`;
  }

  get libellePeriodeFull(): string {
    let stPeriode = 'Courante';
    if (this.typePeriodeComptable == 'precedente') stPeriode = 'Précédente';
    return `${stPeriode} du ${this.dateDebut} au ${this.dateFin}`;
  }

  get typePeriodeComptableId(): string {
    return this.typePeriodeComptable == 'C' ? 'courante' : 'precedente';
  }

  get typePeriodeComptableLibelle(): string {
    if (this.typePeriodeComptable == 'courante') return 'Période courante';
    else if (this.typePeriodeComptable == 'precedente') return 'Période précédente';
    else return '';
  }
}
