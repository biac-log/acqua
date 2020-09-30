export class SecteurDTO {
    public codeSecteur = '';
    public nom = '';
}

export class Secteur extends SecteurDTO {
  constructor(dto?: SecteurDTO) {
    super();
    Object.assign(this, dto || new SecteurDTO());
  }
}
