export class PieceSaveDTO {
  periode = '';
  numeroJournal = 0;
  numeroPiece = 0;
  datePiece = '';
  soldeInitial = 0;
  hash = '';
  extraits: ExtraitSaveDTO[] = [];
}

export class ExtraitSaveDTO {
  numeroExtrait = 0;
  montantBase = 0;
  montantDevise = 0;
  libelle = '';
  codeMouvement = '';
  codeReglement = 0;
  ventilations: VentilationSaveDTO[] = [];
}

export class VentilationSaveDTO {
  numeroVentilation = 0;
  typeCompte = '';
  numeroCompte = 0;
  montantBase = 0;
  montantDevise = 0;
  libelle = '';
  codeDevise = 0;
  numeroCaseTVA = 0;
  codeMouvement = '';
  referenceJournal = 0;
  referencePiece = 0;
  dossier = '';
}
