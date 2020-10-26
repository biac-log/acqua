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
  public email = '';
  public commentaire1 = '';
  public commentaire2 = '';
  public commentaire3 = '';
  public compteAssocie = 0;
  public compteMaitre = 0;
  public codeAssujetti = 0;
  public intraCodePays = '';
  public intraIdentification = '';
  public codeDevise = 0;
  public typeSuivis = 0;
  public compte = '';
  public banAdr = '';
  public banPays = '';
  public banVille = '';
  public banAgence = '';
  public operationsTriangulaires = false;
  public numeroDomiciliation = 0;
  public codeVentilation = 0;
  // Logistique
  public livraisonGlobale = false;
  public tenueBackOrders = false;
  public confirmationCommande = false;
  public documentCertifie = false;
  public facturesGroupees = '';
  public categorieFacturation = '';
  public nombreExemplaireFacture = 0;
  public formulaire = '';
  public transporteur = 0;
  public periodiciteCommande = 0;
  public delaiLivraison = 0;
  public conditionsTransport = '';
  public emissionDocumentCar1 = '';
  public emissionDocumentCar2 = '';
  public emissionDocumentCar3 = '';
  public emissionDocumentCar4 = '';
  public emissionDocumentCar5 = '';
  public tournee1 = 0;
  public tournee2 = 0;
  public tournee3 = 0;
}

export class UpdateFournisseur extends UpdateFournisseurDTO {
  constructor(dto?: UpdateFournisseurDTO) {
    super();
    Object.assign(this, dto || new UpdateFournisseurDTO());
  }
}
