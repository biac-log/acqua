export class SearchFournisseurDTO {
  public type = '';
  public numero = 0;
  public nom = '';
  public matchCode = '';
  public solde = 0; // C'est un decimal, trouver nom en vue
  public adresse = '';
}

export class SearchFournisseur extends SearchFournisseurDTO {
  constructor(dto?: SearchFournisseurDTO) {
    super();
    Object.assign(this, dto || new SearchFournisseurDTO());
  }
}
