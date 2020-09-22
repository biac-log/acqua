export class FournisseurDTO {
  public type = 'F';
  public numero = 0;
  public nom = '';
  public matchCode = '';
  public adresseLigne1 = '';
  public adresseLigne2 = '';
  public localité = '';
  public raisonSociale = '';
  public codePays = '';
  public codePostal = '';
  public contact1 = '';
  public contact2 = '';
  public contact3 = '';
  public numeroTelephone = '';
  public téléfax = '';
  public gsm = '';
  public commentaire1 = '';
  public commentaire2 = '';
  public commentaire3 = '';
  public compteAssocie = 0;
  public compteMaitre = 0;
  public compteVenteAchat = 0;
  public codeAssujetti = 0;
  public intraCodePays = '';
  public intraIdentification = 0;
}

export class Fournisseur extends FournisseurDTO {
  constructor(dto?: FournisseurDTO) {
    super();
    Object.assign(this, dto || new FournisseurDTO());
  }

  get displayName(): string {
    return `${this.numero} - ${this.nom}`.trim();
  }
}
