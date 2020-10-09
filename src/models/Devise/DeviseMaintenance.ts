export interface IDeviseMaintenance {
  id: number;
  libelle: string;
  typeDevise: string;
  cee: boolean;
}

export class DeviseMaintenanceDTO implements IDeviseMaintenance {
  id = 0;
  libelle = '';
  typeDevise = '';
  cee = false;
}

export class DeviseMaintenance extends DeviseMaintenanceDTO {
  constructor(dto?: DeviseMaintenanceDTO) {
    super();
    Object.assign(this, dto || new DeviseMaintenanceDTO());
  }

  public static rules = {
    libelle: [(v: string) => !!v || 'Libellé requis.'],
  };
}
