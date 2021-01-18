export class SocieteDTO {
    id = 0;
    name = '';
    identifiant = '';
    apolloInstanceName = '';
}

export class Societe extends SocieteDTO {
    constructor(dto?: SocieteDTO){
        super();
        Object.assign(this, dto || new SocieteDTO());
    }
}