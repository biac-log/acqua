import moment from "moment";
import { DateTime } from '@/models/DateTime';

export interface IPeriodeComptable {
  debut: string;
  fin: string;
  typePeriodeComptable: string;
}

export class PeriodeComptableDTO implements IPeriodeComptable {
  public debut: string = "";
  public fin: string = "";
  public typePeriodeComptable: string = "";
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
    return `Début ${this.dateDebut} - Fin ${this.dateFin}`;
  }

  get libellePeriodeFull(): string {
    let stPeriode = "Courante";
    if (this.typePeriodeComptable == "precedente") stPeriode = "Précédente";
    return `${stPeriode} du ${this.dateDebut} au ${this.dateFin}`;
  }
}
