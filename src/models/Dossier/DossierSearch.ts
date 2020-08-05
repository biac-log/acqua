import { DateTime } from '../DateTime';

     
export class DossierSearchDTO{
  idDossier = "";
  nom = "";
  dateEntree = "";
  dateSortie = "";
}

export class DossierSearch extends DossierSearchDTO {
  constructor(dto?: DossierSearchDTO){
    super();
    Object.assign(this, dto || new DossierSearchDTO());
  }

  get dateEntreeDate(): DateTime {
    return new DateTime(this.dateEntree);
  }

  get dateSortieDate(): DateTime{
    return new DateTime(this.dateSortie);
  }

  get idNom(): string{
    return `${this.idDossier} ${this.nom}`;
  }

  public dossierIsActif(date: DateTime): boolean{
    return this.dateSortieDate.isMinValue() || date.isBetween(this.dateEntreeDate, this.dateSortieDate);
  }
}