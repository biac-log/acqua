export interface IJournal {
  numero: number;
  libelle: string;
  famille: string;
  devise: string;
  numeroDernierePiece: number;
}

export class JournalDTO implements IJournal {
  numero = 0;
  libelle = '';
  isAutomatique = false;
  famille = '';
  devise = '';
  numeroDernierePiece = 0;
}

export class Journal extends JournalDTO {
  constructor(dto?: JournalDTO) {
    super();
    Object.assign(this, dto || new JournalDTO());
  }

  get fullLibelle(): string {
    return `${this.numero} - ${this.libelle}`;
  }

  get typeCompteChar(): string {
    if (this.famille == 'vente' || this.famille == 'ncvente') return 'C';
    else if (this.famille == 'achat' || this.famille == 'ncachat') return 'F';
    else return '';
  }

  get codeMouvement(): string {
    return this.famille == 'vente' || this.famille == 'ncachat' ? 'DB' : 'CR';
  }

  get description(): string {
    if(!this.devise) return '';
    return `Devise ${this.devise} - Dernière pièce ${this.numeroDernierePiece}`;
  }
}
