import { DateTime } from '@/models/DateTime';
import moment from 'moment';

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
  public email = '';
  public commentaire1 = '';
  public commentaire2 = '';
  public commentaire3 = '';
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
}

export class Fournisseur extends FournisseurDTO {
  constructor(dto?: FournisseurDTO) {
    super();
    Object.assign(this, dto || new FournisseurDTO());
  }

  get displayName(): string {
    return `${this.numero} - ${this.nom}`.trim();
  }

  get fermetureDuDate(): Date {
    return moment(this.fermetureDu).toDate();
  }
  set fermetureDuDate(date: Date) {
    this.fermetureDu = date.toISOString();
  }

  get fermetureAuDate(): Date {
    return moment(this.fermetureAu).toDate();
  }
  set fermetureAuDate(date: Date) {
    this.fermetureAu = date.toISOString();
  }

  // private _fermetureDuDate?: DateTime;
  // get fermetureDuDate(): DateTime {
  //   if (!this._fermetureDuDate) this._fermetureDuDate = new DateTime(this.fermetureDu);
  //   return this._fermetureDuDate;
  // }
  // set fermetureDuDate(date: DateTime) {
  //   this._fermetureDuDate = date;
  //   this.fermetureDu = date.toUtc();
  // }

  // private _fermetureAuDate?: DateTime;
  // get fermetureAuDate(): DateTime {
  //   if (!this._fermetureAuDate) this._fermetureAuDate = new DateTime(this.fermetureAu);
  //   return this._fermetureAuDate;
  // }
  // set fermetureAuDate(date: DateTime) {
  //   this._fermetureAuDate = date;
  //   this.fermetureAu = date.toUtc();
  // }
}
