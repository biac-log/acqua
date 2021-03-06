import { DeviseDTO } from '../../Devise/Devise';
import { CompteBanqueDTO } from './CompteBanque';

export interface IJournal {
  numero: number;
  libelle: string;
  codeDevise: string;
  devise: DeviseDTO;
  numeroDernierePiece: number;
  numeroCompteBanque: number;
  compteBanque: CompteBanqueDTO;
}

export class JournalDTO implements IJournal {
  numero = 0;
  libelle = '';
  codeDevise = '';
  devise: DeviseDTO = new DeviseDTO();
  numeroDernierePiece = 0;
  numeroCompteBanque = 0;
  compteBanque: CompteBanqueDTO = new CompteBanqueDTO();
}

export class Journal extends JournalDTO {
  constructor(dto?: JournalDTO) {
    super();
    Object.assign(this, dto || new JournalDTO());
  }

  get fullLibelle(): string {
    return `${this.numero} - ${this.libelle}`;
  }

  get description(): string {
    if (!this.devise.libelle) return '';
    return `Devise ${this.devise.libelle} - Dernière pièce ${this.numeroDernierePiece}`;
  }
}
