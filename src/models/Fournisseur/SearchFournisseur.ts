import { DateTime } from '@/models/DateTime';

export class SearchFournisseurDTO {
  public Type = '';
  public Numero = 0;
  public Nom = '';
  public MatchCode = '';
  public Solde = 0; // C'est un decimal, trouver nom en vue
  public Adresse = '';
}

export class SearchFournisseur extends SearchFournisseurDTO {
  constructor(dto?: SearchFournisseurDTO) {
    super();
    Object.assign(this, dto || new SearchFournisseurDTO());
  }
}
