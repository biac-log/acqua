export class ParametreDTO {
  public modeDossier = false;
  public deviseParDate = false;
  public modeLuxembourg = false;
}

export class Parametre extends ParametreDTO {
  constructor(dto?: ParametreDTO) {
    super();
    Object.assign(this, dto || new ParametreDTO());
  }
}
