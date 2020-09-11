export class FournisseurDTO {
    public type = 'F';
    public numero = 0;
    public nom = '';
    public matchCode = '';
    public adresseLigne1 = '';
    public adresseLigne2 = '';
    public localité = '';
    public raisonSociale = '';
    public codePays = '';
    public codePostal = '';
    public contact1 = '';
    public contact2 = '';
    public contact3 = '';
    public numeroTelephone = '';
    public téléfax = '';
    public gsm = '';
    public commentaire1 = '';
    public commentaire2 = '';
    public commentaire3 = '';
}

export class Fournisseur extends FournisseurDTO {
    constructor(dto?: FournisseurDTO) {
        super();
        Object.assign(this, dto || new FournisseurDTO());
    }

    get displayName(): string {
        return `${this.numero} - ${this.nom}`.trim();
    }

    public static rules = {
        "nom": [
            (v: string) => !!v || 'Nom requis.',
        ],
        "adresseLigne1": [
            (v: string) => !!v || 'Adresse requise.',
        ],
        "codePostal": [
            (v: string) => !!v || 'Code postal requis.',
        ],
        "codePays": [
            (v: string) => !!v || 'Code pays requis.',
        ],
        "localite": [
            (v: string) => !!v || 'Localité requise.',
        ],
    };
}