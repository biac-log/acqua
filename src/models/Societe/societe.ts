export class SocieteDTO {
    id = 0;
    name = '';
    apolloPath = '';
    databaseName = '';
}

export class Societe extends SocieteDTO {
    constructor(dto?: SocieteDTO){
        super();
        Object.assign(this, dto || new SocieteDTO());
    }
}