import { DateTime } from '@/models/DateTime';

export class SearchFournisseurDTO
{
    public Type: string = "";
    public Numero: number = 0;
    public Nom: string = "";
    public MatchCode: string = "";
    public Solde: number = 0; // C'est un decimal, trouver nom en vue
    public Adresse: string = "";

}
  
  export class SearchFournisseur extends SearchFournisseurDTO {
    constructor(dto?: SearchFournisseurDTO) {
      super();
      Object.assign(this, dto || new SearchFournisseurDTO());
    }
}