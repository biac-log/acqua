export class CaseTvaMaintenanceDTO {
    vatKey = 'VAT';
    numeroCase = 0;
    libelleCase = '';
    typeCase = 0;
    tauxTvaCase = 0;
    tauxEgalisationCase = 0;
    ncSurVente = false;
    facturesAchat = false;
    facturesVentes = false;
    ncSurAchat = false;
    financiers = false;
    od = false;
    natureCase = '';
    libelleTypeCase = '';
    codePays = '';
    intrastat = false;
    tauxNature = 0;
    hash = '';
}

export class TypeCase {
    public text = '';
    public value = '';

    constructor(text: string, value: string) {
        this.text = text;
        this.value = value;
    }
}

export class CaseTvaMaintenance extends CaseTvaMaintenanceDTO {
    constructor(dto?: CaseTvaMaintenanceDTO) {
        super();
        Object.assign(this, dto || new CaseTvaMaintenanceDTO());
    }

    get getLibelleCase(): string {
        return `${this.numeroCase} - ${this.libelleCase}`;
    }

    get libelleType(): string {
        const libelle: string = CaseTvaMaintenance.types.find((t) => t.value.toNumber() == this.typeCase)?.text ?? '';

        return libelle;
    }

    static rules = {
        numero: [(v: string) => !!v || 'Numéro requis', (v: string) => v.length <= 3 || 'Max. 3 caractères' ],
        libelle: [(v: string) => !!v || 'Libellé requis', (v: string) => v.length <= 5 || 'Max. 5 caractères' ],
        typeCase: [(v: string) => !!v || 'Type requis', (v: string) => CaseTvaMaintenance.types.find((t) => t.text == v) != null || 'Valeur incorrecte'],
        natureCase: [(v: string) => !!v || 'Nature requise', (v: string) => CaseTvaMaintenance.natures.find((n) => n.text == v) != null || 'Valeur incorrecte'],        
    };

    static types = [
        new TypeCase("Taxé", "1"),
        new TypeCase("TVA Inclus", "4"),
        new TypeCase("Non taxé", "5"),
        new TypeCase("Escompte", "9"),
        new TypeCase("TVA", "50"),
        new TypeCase("Taxe Luxe", "51"),
    ];

    static natures = [
        {text: "V - Vente", value: "V"},
        {text: "VT - Vente Tabac", value: "VT"},
        {text: "PP - Prélèv. Privé", value: "PP"},
        {text: "UP - Usage Privé", value: "UP"},
        {text: "A - Achat", value: "A"},
        {text: "AT - Achat Tabac", value: "AT"},
        {text: "F - Frais", value: "F"},
        {text: "I - Investissement", value: "I"},
        // Livraison/Acquisition Intracom
        {header: "Livraison/Acquisition Intracom"},
        {text: "VE - Livraison", value: "VE"},
        {text: "AI - Acquisition", value: "AI"},
        {text: "FI - Frais", value: "FI"},
        {text: "II - Investissement", value: "II"},
        {text: "IT - Tabac", value: "IT"},
        // Livraison/Acquisition Hors CEE
        {header: "Livraison/Acquisition Hors CEE"},
        {text: "AH - Acquisition", value: "AH"},
        {text: "FH - Frais", value: "FH"},
        {text: "IH - Investissement", value: "IH"},
        {text: "HT - Tabac", value: "HT"},
        // Prestation/Service Intra
        {header: "Prestation/Service Intra"},
        {text: "PV - Vente", value: "PV"},
        {text: "PA - Achat", value: "PA"},
        {text: "PF - Frais", value: "PF"},
        {text: "PI - Investissement", value: "PI"},
        // Prestation/Service Hors CEE
        {header: "Prestation/Service Hors CEE"},
        {text: "SV - Vente", value: "SV"},
        {text: "SA - Achat", value: "SA"},
        {text: "SF - Frais", value: "SF"},
        {text: "SI - Investissement", value: "SI"},
        // Opérations triangulaires
        {header: "Opérations triangulaires"},
        {text: "TV - Vente", value: "TV"},
        {text: "TA - Achat", value: "TA"},
        // Divers
        {header: "Divers"},
        {text: "26 - Article 26.1B", value: "26"},
        {text: "43 - Article 43", value: "43"},
        {text: "44 - Article 44 & 56", value: "44"},
        {text: "50 - Article 50", value: "50"},
        {text: "PE - Prest. Exonér.", value: "PE"},
        {text: "OE - Opér. Etrang.", value: "OE"},
        {text: "T - TVA", value: "T"},
        {text: "ND - Non défini", value: "ND"},
        // Déclarations étrangères
        {header: "Déclarations étrangères"},
        {text: "VX - Vente", value: "VX"},
        {text: "BX - Achat", value: "BX"},
        {text: "FX - Frais", value: "FX"},
        {text: "AX - Achat", value: "AX"},
        {text: "PX - Vente prest.", value: "PX"},
        {text: "SX - Achat Prest.", value: "SX"},
        {text: "IX - Investiss.", value: "IX"},
        {text: "TX - TVA", value: "TX"},
        // Intracom étrangers
        {header: "Intracom étrangers"},
        {text: "XL - Vente intracom.", value: "XL"},
        {text: "XE - Vente Export", value: "XE"},
        {text: "XA - Achat Intracom.", value: "XA"},
        {text: "XI - Importation", value: "XI"},
        {text: "YV - 13B All. Vente", value: "YV"},
        {text: "YA - 13B All. Achat", value: "YA"},
    ];
}


