export class CreateCaseTvaDTO {
    libelleCase = '';
    typeCase = '';
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
}

export class CreateCaseTva extends CreateCaseTvaDTO {
    constructor(dto?: CreateCaseTvaDTO) {
        super();
        Object.assign(this, dto || new CreateCaseTvaDTO());
    }
}
