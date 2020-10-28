export class CaseTvaMaintenanceDTO {
    vatKey = '';
    numeroCase = 0;
    libelleCase = '';
    typeCase = '';
    tauxTvaCase = '';
    tauxEgalisationCase = '';
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
}

export class CaseTvaMaintenance extends CaseTvaMaintenanceDTO {
    constructor(dto?: CaseTvaMaintenanceDTO) {
        super();
        Object.assign(this, dto || new CaseTvaMaintenanceDTO());
    }

    get getLibelleCase(): string {
        return `${this.numeroCase} - ${this.libelleCase}`;
    }
}
