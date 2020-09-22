export class UpdateFournisseurDTO {
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
  public codeAssujetti = 0;
  public intraCodePays = '';
  public intraIdentification = 0;
  public codeDevise = 0;
}

export class UpdateFournisseur extends UpdateFournisseurDTO {
  constructor(dto?: UpdateFournisseurDTO) {
    super();
    Object.assign(this, dto || new UpdateFournisseurDTO());
  }
}
