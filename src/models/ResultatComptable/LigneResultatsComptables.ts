export class LigneResultatsComptablesDTO {
    public level = -1;
    public levelName = "";
    public libelle = "";
    public montantP1 = 0;
    public montantP2 = 0;
  }
  
  export class LigneResultatsComptables extends LigneResultatsComptablesDTO {
    constructor(dto?: LigneResultatsComptablesDTO) {
      super();
      Object.assign(this, dto || new LigneResultatsComptablesDTO());
    }
  }
  