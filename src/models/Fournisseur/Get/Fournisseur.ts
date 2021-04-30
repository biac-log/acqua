import { DateTime } from '@/models/DateTime';

export class FournisseurDTO {
  // Signalétique
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
  public email = '';
  public commentaire1 = '';
  public commentaire2 = '';
  public commentaire3 = '';

  // Comptabilité
  public compteAssocie = 0;
  public nomCompteAssocie = '';
  public compteMaitre = 0;
  public nomCompteMaitre = '';
  public compteVenteAchat = 0;
  public nomCompteVenteAchat = '';
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

  // Commercial
  public codeRepresentant = 0;
  public nomRepresentant = '';
  public codeFamille = 0;
  public nomFamille = '';
  public codeSecteur = 0;
  public nomSecteur = '';
  public codeNace = 0;
  public codeLangue = 0;
  public libelleLangue = '';
  public codePaiement = ''; // FinDeMois
  public libellePaiement = '';
  public nombreDeJoursPaiement = 0;
  public escompte = 0;
  public joursEscomptes = 0;
  public limiteCredit = 0;
  public codePrix = 0;
  public libellePrix = '';
  public tarif = '';
  public codeRemise = 0;
  public libelleRemise = '';
  public remiseGlobaleDefaut = 0;
  public francoMontant = 0;
  public fermetureDu = '';
  public fermetureAu = '';

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

export class Fournisseur extends FournisseurDTO {
  constructor(dto?: FournisseurDTO) {
    super();
    Object.assign(this, dto || new FournisseurDTO());
  }

  get displayName(): string {
    return `${this.numero} - ${this.nom}`.trim();
  }

  private _fermetureDuDate?: DateTime;
  get fermetureDuDate(): DateTime {
    if (!this._fermetureDuDate) this._fermetureDuDate = new DateTime(this.fermetureDu);
    return this._fermetureDuDate;
  }
  set fermetureDuDate(date: DateTime) {
    this._fermetureDuDate = date;
    this.fermetureDu = date.toUtc();
  }

  private _fermetureAuDate?: DateTime;
  get fermetureAuDate(): DateTime {
    if (!this._fermetureAuDate) this._fermetureAuDate = new DateTime(this.fermetureAu);
    return this._fermetureAuDate;
  }
  set fermetureAuDate(date: DateTime) {
    this._fermetureAuDate = date;
    this.fermetureAu = date.toUtc();
  }

  public static rules = {
    nom: [(v: string) => !!v || 'Nom requis.'],
    email: [(v: string) => !v || /\S+@\S+\.\S+/.test(v) || 'Adresse email invalide'],
    codeVentilation: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    nombreDeJoursPaiement: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    joursEscomptes: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    nombreExemplaireFacture: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    periodiciteCommande: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    delaiLivraison: [(v: string) => !v || !!v.isInt() || 'Nombre invalide'],
    escompte: [(v: string) => !v || !!v.toNumber() || 'Nombre invalide'],
    remiseGlobaleDefaut: [(v: string) => !v || !!v.toNumber() || 'Nombre invalide'],
    francoMontant: [(v: string) => !v || !!v.toNumber() || 'Nombre invalide'],
    limiteCredit: [(v: string) => !v || !!v.toNumber() || 'Nombre invalide'],
    tournees: [
      (v: string[]) => v.length <= 3 || '3 valeurs max.',
      (v: string[]) => v.every((f) => f.isInt()) || 'Nombres uniquement',
      (v: string[]) => v.every((f) => f.length <= 3) || 'Valeurs limitées à 3 caractères'
    ]
  };
}
