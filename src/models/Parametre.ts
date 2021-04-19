export class ParametreDTO {
  public modeDossier = false;
  public deviseParDate = false;
  public luxembourg = false;
  public pathApolloPlaceholder = '';
}

export class Parametre extends ParametreDTO {
  constructor(dto?: ParametreDTO) {
    super();
    Object.assign(this, dto || new ParametreDTO());
  }
}
