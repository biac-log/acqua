export class RepresentantDTO {
  public code = 0;
  public nom = '';
  public raisonSociale = '';
  public ligneAdresse1 = '';
  public ligneAdresse2 = '';
  public ligneAdresse3 = '';
  public codePays = '';
  public codePostal = '';
  public telephone = '';
  public compteBancaire = '';
  public codeLangue = '';
  public pourcentageCommi = 0;
  public departement = '';
}

export class Representant extends RepresentantDTO {
  constructor(dto?: RepresentantDTO) {
    super();
    Object.assign(this, dto || new RepresentantDTO());
  }

  get adresse(): string {
    return `${this.ligneAdresse1} ${this.ligneAdresse2} ${this.ligneAdresse3}`;
  }
}
