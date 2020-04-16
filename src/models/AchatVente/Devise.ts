export interface IDevise {
  id:number;
  libelle: string;
  typeDevise: string;
}

export class DeviseDTO implements IDevise{
  id:number = 0;
  libelle: string = "";
  typeDevise: string = "";
}

export class Devise extends DeviseDTO {
  constructor(dto?: DeviseDTO){
    super();
    Object.assign(this, dto || new DeviseDTO());
  }
}