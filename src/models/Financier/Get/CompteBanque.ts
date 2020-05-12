  
  export class CompteBanqueDTO{
    type = "";
    numero = 0;
    nom = "";
    solde = 0;
    nature = "";
    libelleNature = "";
    numeroCase = 0;
    libelleCase = "";
  }
  
  export class CompteBanque extends CompteBanqueDTO {
    constructor(dto?: CompteBanqueDTO){
      super();
      Object.assign(this, dto || new CompteBanqueDTO());
    }
  }