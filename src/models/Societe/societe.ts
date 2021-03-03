import moment from "moment";

export class SocieteDTO {
    id = 0;
    name = '';
    identifiant = '';
    apolloInstanceName = '';
    hash = '';
    syncedAt = '';
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

    get syncedAtFormatted(): string {
        
        return this.syncedAt != "0001-01-01T00:00:00" ? moment(this.syncedAt).toDate().toLocaleString('fr') : "Pas encore synchronisé";
      }
      set syncedAtString(date: Date) {
        this.syncedAt = date.toISOString();
      }
}