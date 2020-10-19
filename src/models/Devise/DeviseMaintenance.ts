export interface IDeviseMaintenance {
  id: number;
  libelle: string;
  typeDevise: string;
  cee: boolean;
  hash: string;
}

export class DeviseMaintenanceDTO implements IDeviseMaintenance {
  id = 0;
  libelle = '';
  typeDevise = '';
  cee = false;
  hash = '';
}

export class DeviseMaintenance extends DeviseMaintenanceDTO {
  constructor(dto?: DeviseMaintenanceDTO) {
    super();
    Object.assign(this, dto || new DeviseMaintenanceDTO());
  }

  public static rules = {
    libelle: [(v: string) => !!v || 'Libellé requis.']
  };
}
