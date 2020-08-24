export interface IApplication {
  Id: string;
  Nom: string;
  Description: string;
}

export class ApplicationDTO implements IApplication {
  Id = '';
  Nom = '';
  Description = '';
}

export class Application extends ApplicationDTO {
  constructor(dto?: ApplicationDTO) {
    super();
    Object.assign(this, dto || new ApplicationDTO());
  }
}
