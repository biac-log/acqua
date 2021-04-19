import { DeviseDTO } from '../Devise/Devise';

export class JournalDTO {
  numero = 0;
  libelle = '';
  codeDevise = '';
  devise: DeviseDTO = new DeviseDTO();
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

  get description(): string {
    return `Devise ${this.devise.libelle} - Dernière pièce ${this.numeroDernierePiece}`;
  }
}
