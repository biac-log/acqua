export class RepresentantDTO {
    public code = 0;
    public nom = '';
}

export class Representant extends RepresentantDTO {
  constructor(dto?: RepresentantDTO) {
    super();
    Object.assign(this, dto || new RepresentantDTO());
  }

}
