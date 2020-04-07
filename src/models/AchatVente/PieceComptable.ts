  import PieceComptableContrepartie, { IPieceComptableContrepartie } from "./PieceComptableContrepartie"
  
  export interface IPieceComptable {
    numeroJournal:number;
    numeroPiece:number;
    codeDevise:number;
    libelleDevise: string;
    libelle: string;
    taux:number;
    montantDevise:number;
    montantBase:number;
    datePiece: Date;
    dateEcheance: Date;
    montantEscompteDevise:number;
    montantEscompteBase:number;
    pieceAcquittee: boolean;
    statut:number;
    statutLibelle: string;
    compteTiersCodeDevise:number;
    compteTiersLibelleDevise: string;
    compteTiersNumero:number;
    compteTiersNom: string;
    compteTiersSoldeComptable:number;
    delaiPaiementLibelle: string;
    compteTiersEscomptePourcentage: string;
    compteTiersEscompteNombreJours: string;
    compteAssocieNumero: string;
    compteAssocieNom: string;
    compteVenteAchatNumero:number;
    compteVenteAchatNom: string;
    deviseComptaLibelle: string;
    hash:string;
    contreparties: IPieceComptableContrepartie[];   
  }
  
  export class PieceComptableDTO implements IPieceComptable{
    public numeroJournal:number= 0;
    public numeroPiece:number=0;
    public codeDevise:number= 0;
    public libelleDevise: string="";
    public libelle: string="";
    public taux:number=0;
    public montantDevise:number=0;
    public montantBase:number=0;
    public datePiece: Date = new Date();
    public dateEcheance: Date = new Date();
    public montantEscompteDevise:number=0;
    public montantEscompteBase:number=0;
    public pieceAcquittee: boolean = false;
    public statut:number=0;
    public statutLibelle: string="";
    public compteTiersCodeDevise:number=0;
    public compteTiersLibelleDevise: string="";
    public compteTiersNumero:number=0;
    public compteTiersNom: string="";
    public compteTiersSoldeComptable:number=0;
    public delaiPaiementLibelle: string="";
    public compteTiersEscomptePourcentage: string="";
    public compteTiersEscompteNombreJours: string="";
    public compteAssocieNumero: string="";
    public compteAssocieNom: string="";
    public compteVenteAchatNumero:number=0;
    public compteVenteAchatNom: string="";
    public deviseComptaLibelle: string="";
    public hash:string="";
    public contreparties: PieceComptableContrepartie[] = [];    
  }
  
  export default class PieceComptable extends PieceComptableDTO {
    constructor(dto?: PieceComptableDTO){
      super();
      Object.assign(this, dto || new PieceComptableDTO());
      if(dto){
        this.contreparties = [];
        dto.contreparties.forEach(element => {
          this.contreparties.push(new PieceComptableContrepartie(element));
        });
      }
    }
  
    get libelleStatut(): string {
      return `${this.statut} ${this.statutLibelle}`;
    }

    get libelleMontantCompta(): string {
      return `${this.montantBase.toFixed(2)} ${this.deviseComptaLibelle}`;
    }

    get stringMontantCompta(): string {
      return `${this.montantBase.toFixed(2)} ${this.deviseComptaLibelle}`;
    }

    get libelleCompteAssocie(): string{
      return `${this.compteAssocieNumero} ${this.compteAssocieNom}`;
    }

    get libelleCompteVenteAchat(): string{
      return `${this.compteVenteAchatNumero} ${this.compteVenteAchatNom}`;
    }

    get libelleSoldeCompteTiers(): string{
      return `${this.compteTiersSoldeComptable.toFixed(2)} ${this.compteTiersLibelleDevise}`;
    }
  }