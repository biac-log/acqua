export class FournisseurDTO {
    public type = '';
    public numero = 0;
    public nom = '';
    public matchCode = '';
    public solde = 0;
    public adresse = '';
}

export class Fournisseur extends FournisseurDTO {
    constructor(dto?: FournisseurDTO) {
        super();
        Object.assign(this, dto || new FournisseurDTO());
    }
}