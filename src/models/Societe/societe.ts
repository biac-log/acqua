export class SocieteDTO {
    id = 0;
    name = '';
    identifiant = '';
    apolloInstanceName = '';
    hash = '';
}

export class Societe extends SocieteDTO {
    constructor(dto?: SocieteDTO){
        super();
        Object.assign(this, dto || new SocieteDTO());
    }

    public static rules = {
        'name': [(v: string) => !!v || 'Nom requis.'],
        'identifiant': [(v: string) => !!v || 'Identifiant requis.'],
        'instanceName': [(v: string) => !!v || 'Nom d\'instance requis.']
    }
}