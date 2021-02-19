export class CompteSimpleDTO {
    numero = 0;
    nom = '';
  }
  
  export class CompteSimple extends CompteSimpleDTO {
    constructor(dto?: CompteSimpleDTO) {
      super();
      Object.assign(this, dto || new CompteSimpleDTO());
    }
  }
  