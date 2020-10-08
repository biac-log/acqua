export interface IDevise {
  id: number;
  libelle: string;
  typeDevise: string;
  cee: boolean;
}

export class DeviseDTO implements IDevise {
  id = 0;
  libelle = '';
  typeDevise = '';
  cee = false;
}

export class Devise extends DeviseDTO {
  constructor(dto?: DeviseDTO) {
    super();
    Object.assign(this, dto || new DeviseDTO());
  }
}
