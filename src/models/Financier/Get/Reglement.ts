export class ReglementDTO {
  numero = 0;
  libelle = '';
}

export class Reglement extends ReglementDTO {
  constructor(dto?: ReglementDTO) {
    super();
    Object.assign(this, dto || new ReglementDTO());
  }
}
