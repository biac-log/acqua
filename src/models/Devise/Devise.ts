export interface IDevise {
  id: number;
  libelle: string;
  typeDevise: string;
}

export class DeviseDTO implements IDevise {
  id = 0;
  libelle = '';
  typeDevise = '';
}

export class Devise extends DeviseDTO {
  constructor(dto?: DeviseDTO) {
    super();
    Object.assign(this, dto || new DeviseDTO());
  }
}
