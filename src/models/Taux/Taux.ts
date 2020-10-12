import { DateTime } from '../DateTime';

export interface ITaux {
  base: string;
  code: string;
  date: string;
  com: number;
  tar: number;
}

export class TauxDTO implements ITaux {
  base = '';
  code = '';
  date = '';
  com = 0;
  tar = 0;
}

export class Taux extends TauxDTO {
  constructor(dto?: TauxDTO) {
    super();
    Object.assign(this, dto || new TauxDTO());
  }

  private _dateDate?: DateTime;
  get dateDate(): DateTime {
    if (!this._dateDate) this._dateDate = new DateTime(this.date);
    return this._dateDate;
  }
  set dateDate(date: DateTime) {
    this._dateDate = date;
    this.date = date.toUtc();
  }
}
