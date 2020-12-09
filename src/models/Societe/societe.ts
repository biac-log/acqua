export class SocieteDTO {
    nom = '';
    slug = '';
    apolloPath = '';
    dbName = '';
}

export class Societe extends SocieteDTO {
    constructor(dto?: SocieteDTO){
        super();
        Object.assign(this, dto || new SocieteDTO());
    }
}