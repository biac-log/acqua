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

  get dateEntreeDate(): Date{
    return new Date(this.dateEntree);
  }

  get dateSortieDate(): Date{
    return new Date(this.dateSortie);
  }

  get idNom(): string{
    return `${this.idDossier} ${this.nom}`;
  }

  public dossierIsActif(date: DateTime): boolean{
    return date.isBetween(new DateTime(this.dateEntreeDate), new DateTime(this.dateSortieDate));
  }
}