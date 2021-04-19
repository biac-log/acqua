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
    numero: [(v: string) => !!v || 'Numéro requis', (v: string) => v.length <= 3 || 'Max. 3 caractères'],
    libelle: [(v: string) => !!v || 'Libellé requis', (v: string) => v.length <= 5 || 'Max. 5 caractères'],
    typeCase: [
      (v: string) => !!v || 'Type requis',
      (v: string) => CaseTvaMaintenance.types.find((t) => t.value == v) != null || 'Valeur incorrecte'
    ],
    natureCase: [(v: string) => !!v || 'Nature requise']
  };

  static types = [
    new TypeCase('Taxé', '1'),
    new TypeCase('TVA Inclus', '4'),
    new TypeCase('Non taxé', '5'),
    new TypeCase('Escompte', '9'),
    new TypeCase('TVA', '50'),
    new TypeCase('Taxe Luxe', '51')
  ];

  static requiresCountryCode = [
    'VE',
    'AI',
    'II',
    'FI',
    'IT',
    'PV',
    'PA',
    'PF',
    'PI',
    'VX',
    'BX',
    'FX',
    'AX',
    'PX',
    'SX',
    'IX',
    'TX',
    'XL',
    'XE',
    'XA',
    'XI',
    'YV',
    'YA'
  ];
}
