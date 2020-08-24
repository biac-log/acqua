export interface IDepartement {
  Id: string;
  Nom: string;
}

export class DepartementDTO implements IDepartement {
  Id = '';
  Nom = '';
}

export class Departement extends DepartementDTO {
  constructor(dto: DepartementDTO) {
    super();
    Object.assign(this, dto);
  }
}
