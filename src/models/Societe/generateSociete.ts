import { SocieteModule } from "@/store/modules/companies";
import { Societe } from "./societe";

export class GenerateSociete {
    public path = '';
    public created = false;
    public synced = false;
    public syncedAt = '';

    constructor(path: string) {
        this.path = path;
        const identifiant = path.split('\\').last().toSlug();
        const societe = SocieteModule.societes.find((s) => s.identifiant == identifiant)
        if (societe) {
            this.created = true;
            this.synced = societe.syncedAt != "0001-01-01T00:00:00";
            if (this.synced) this.syncedAt = societe.syncedAtFormatted;
        }
    }
}