export class SocieteDTO {
    id = 0;
    name = '';
    identifiant = '';
}

export class Societe extends SocieteDTO {
    constructor(dto?: SocieteDTO){
        super();
        Object.assign(this, dto || new SocieteDTO());
    }
}