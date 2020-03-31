export class EntetePieceComptable {
    public codeJournal: number = 0;
    public codePiece: number = 0;
    public escompte: number = 0;
    public libelle: string = '';
    public datePiece: Date = new Date();
    public dateEcheance: Date = new Date();
    public status: number = 0;
    public montant: number = 0;
    public numeroCompte: number = 0;
    public nomCompte: string = "";
    public devise: string = "";
  }
  export class Journal {
    public numero: number = 0;
    public libelle: string = '';
    public isAutomatique: boolean = false;
    public famille: string = '';
    public devise: string = '';
    public numeroDernierePiece: number = 0;
  }

  export class PeriodeComptable {
    public debut: Date = new Date();
    public fin: Date = new Date();
    public typePeriodeComptable: string = '';
  }

  export class PieceComptable
  {
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
    public contreparties:PieceComptableContrepartie[] =[];    
  }

  export class PieceComptableContrepartie
  {
    public numeroLigne:number=0;
    public typeCompte: string="";
        public numeroCompte:number=0;
        public compteLibelle: string="";
        public libelle: string="";
        public codeMouvement: string="";
        public montantDevise:number=0;
        public montantBase:number=0;
        public codeDevise:number=0;
        public libelleDevise: string="";
        public numeroCase:number=0;
        public libelleCase: string="";

        public compteDisplay:string="";
        public montantDebit:number=0;
        public montantCredit:number=0;
  }

