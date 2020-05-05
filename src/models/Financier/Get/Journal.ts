
import { Devise, DeviseDTO } from "./Devise";
import { CompteBanqueDTO } from './CompteBanque';
  
export interface IJournal {
  numero: number;
  libelle: string;
  codeDevise: string;
  devise: DeviseDTO;
  numeroDernierePiece: number;
  numeroCompteBanque: number,
  compteBanque: CompteBanqueDTO;
}

export class JournalDTO implements IJournal{
  numero: number = 0;
  libelle: string = "";
  codeDevise: string = "";
  devise: DeviseDTO = new DeviseDTO();
  numeroDernierePiece: number = 0;
  numeroCompteBanque: number = 0;
  compteBanque: CompteBanqueDTO = new CompteBanqueDTO();
}

export class Journal extends JournalDTO {
  constructor(dto?: JournalDTO){
    super();
    Object.assign(this, dto || new JournalDTO());
  }

  get fullLibelle(): string {
    return `${this.numero} - ${this.libelle}`;
  }

  get description(): string {
    return `Devise ${this.devise.libelle} - Dernière pièce ${this.numeroDernierePiece}`;
  }
}