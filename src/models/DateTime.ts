import moment, { Moment } from 'moment';
// import { Permission } from "./Permission";

export class DateTime {
  public date: Moment;

  constructor(date?: string | Date | Moment) {
    this.date = this.momentify(date || new Date());
  }

  private momentify(date: string | Date | Moment | undefined): Moment {
    if (date) {
      if (typeof date === 'string' && (date.length == 10 || date.length == 8)) {
        if (date.indexOf('-') > -1 && date.split('-')[0].length == 4) return moment(date, 'YYYY-MM-DD');
        else if (date.indexOf('-') > -1 && date.split('-')[0].length == 2) return moment(date, 'DD-MM-YYYY');
        else if (date.indexOf('/') > -1) return moment(date, 'DD/MM/YYYY');
        else if (moment(date, 'DDMMYYYY').isValid()) return moment(date, 'DDMMYYYY');
        else return moment.invalid();
      } else if (moment(date).isValid()) return moment(date);
      else return moment.invalid();
    } else return moment.invalid();
  }

  public toString(format = 'DD/MM/YYYY'): string {
    if (this.date.isSame(DateTime.minValue())) return '';
    else return this.date.format(format);
  }

  public toUtc(format = 'YYYY-MM-DD'): string {
    return this.date.format(format);
  }

  public toJsonDateTime() {
    return this.date.format('YYYY-MM-DD[T]HH:mm:ss');
  }

  public isBefore(date: DateTime | string): boolean {
    if (!(date instanceof DateTime)) date = new DateTime(date);
    return this.date.isBefore(date.date);
  }
  public isAfter(date: DateTime): boolean {
    if (!(date instanceof DateTime)) date = new DateTime(date);
    return this.date.isAfter(date.date);
  }

  public isSameOrBefore(date: DateTime): boolean {
    if (!(date instanceof DateTime)) date = new DateTime(date);
    return this.date.isSameOrBefore(date.date);
  }
  public isSameOrAfter(date: DateTime): boolean {
    if (!(date instanceof DateTime)) date = new DateTime(date);
    return this.date.isSameOrAfter(date.date);
  }

  public isBetween(dateMin: DateTime, dateMax: DateTime) {
    if (!(dateMin instanceof DateTime)) dateMin = new DateTime(dateMin);
    if (!(dateMax instanceof DateTime)) dateMax = new DateTime(dateMax);
    return this.isSameOrAfter(dateMin) && this.isSameOrBefore(dateMax);
  }

  public isSame(date: DateTime): boolean {
    if (!(date instanceof DateTime)) date = new DateTime(date);

    return this.date.isSame(date.date);
  }

  public isValid(): boolean {
    return !!this.date?.isValid();
  }

  public isMinValue(): boolean {
    return this.date.isSame(DateTime.minValue());
  }

  static today(format = 'DD/MM/YYYY') {
    return new DateTime(moment().format(format));
  }
  static isValid(date: string | Date | Moment): boolean {
    return new DateTime(date).isValid();
  }

  static minValue() {
    return moment('0001-01-01');
  }
}
