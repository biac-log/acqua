export interface ITypeCompte {
  id: string;
  libelle: string;
}

export class TypeCompteDTO implements ITypeCompte{
  id: string = "";
  libelle: string = "";
}

export class TypeCompte extends TypeCompteDTO {
  constructor(dto?: TypeCompteDTO){
    super();
    Object.assign(this, dto || new TypeCompteDTO());
  }
}