
export interface IPeriodeComptable {
  debut:Date;
  fin: Date;
  typePeriodeComptable: string;
}

export class PeriodeComptableDTO implements IPeriodeComptable{
  public debut: Date = new Date();
  public fin: Date = new Date();
  public typePeriodeComptable: string = '';
}

export class PeriodeComptable extends PeriodeComptableDTO {
  constructor(dto?: PeriodeComptableDTO){
    super();
    Object.assign(this, dto || new PeriodeComptableDTO());
  }
}