export class VentilationDTO{
  numeroVentilation = 0;
  typeCompte = "";
  numeroCompte = 0;
  nomCompte = "";
  referenceJournal = 0;
  referencePiece = 0;
  libelle = "";
  codeMouvement = "";
  montantDevise = 0;
  montantBase = 0;
  codeDevise = 0;
  libelleDevise = "";
  codeCaseTVA = 0;
  libelleCaseTVA = "";
}

export class Ventilation extends VentilationDTO {
  constructor(dto?: VentilationDTO){
    super();
    Object.assign(this, dto || new VentilationDTO());
  }

  get montantDebit(): string{
    return this.codeMouvement == "DB" ? this.montantDevise.toFixed(2) : "";
  }

  get montantCredit(): string{
    return this.codeMouvement != "DB" ? this.montantDevise.toFixed(2) : "";
  }
}