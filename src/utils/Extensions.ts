interface Number {
  toDecimalString(nbDecimal?: number): string;
  toIntString(): string;
  toComptaString(nbDecimal?: number, showZero?: boolean): string;
  montantNegatifString(nbDecimal?: number, showZero?: boolean): string;
  padStart(nbPad?: number): string;
}

interface String {
  isInt(required?: boolean): boolean;
  isDecimal(required?: boolean): boolean;
  toNumber(): number;
  toSlug(): string;
}

Number.prototype.toDecimalString = function(nbDecimal = 2) {
  if (!nbDecimal) nbDecimal = 2;

  if (!this) return '';
  else
    return Intl.NumberFormat('fr-FR', { minimumFractionDigits: nbDecimal, maximumFractionDigits: nbDecimal }).format(
      +this
    );
};

Number.prototype.toIntString = function() {
  if (!this) return '';
  else return Intl.NumberFormat('fr-FR').format(this as number);
};

Number.prototype.toComptaString = function(nbDecimal = 2, showZero = false) {
  if (!nbDecimal) nbDecimal = 2;
  if (!this && !showZero) return '';
  else {
    if (+this >= 0)
      return Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: nbDecimal,
        maximumFractionDigits: nbDecimal
      }).format(Math.abs(+this)) + " ";
    else
      return `${Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: nbDecimal,
        maximumFractionDigits: nbDecimal
      }).format(Math.abs(+this))}-`;
  }
};

Number.prototype.montantNegatifString = function(nbDecimal = 2, showZero = false) {
  if (!nbDecimal) nbDecimal = 2;
  if (!this && !showZero) return '';
  else {
    if (+this >= 0)
      return Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(+this));
    else
      return `-${Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Math.abs(+this)
      )}`;
  }
};

Number.prototype.padStart = function(nbPad = 3) {
  return this.toString().padStart(nbPad, '0');
};

String.prototype.isInt = function(required = false) {
  if (!this) return !required;
  else {
    let number = this.endsWith('-') ? `-${this.replace('-', '')}` : this;
    number = number.toString();
    return !isNaN(parseInt(number.toString())) && isFinite(+number);
  }
};

String.prototype.isDecimal = function(required = false) {
  if (!this) return !required;
  else {
    let number = this.endsWith('-') ? `-${this.replace('-', '')}` : this;
    number = number
      .replace(/\./g, '')
      .replace(/\s/g, '')
      .replace(',', '.');

    return !isNaN(parseFloat(number.toString())) && isFinite(+number);
  }
};

String.prototype.toNumber = function() {
  const numberString = this.endsWith('-') ? `-${this.replace('-', '')}` : this;
  const number = +numberString;

  if (number || number == 0) return number;
  else
    return +numberString
      .replace(/\./g, '')
      .replace(/\s/g, '')
      .replace(',', '.');
};

String.prototype.toSlug = function() {
  const trimmedString = this.replace(/^\s+|\s+$/g, '');
  let toLower = trimmedString.toLowerCase();

  const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
  const to = 'aaaaaeeeeeiiiiooooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    toLower = toLower.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  const returnString = toLower
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return returnString;
};

interface Array<T> {
  isEmpty(): boolean;
  last(): T;
}

Array.prototype.isEmpty = function() {
  return this.length == 0;
};

Array.prototype.last = function() {
  return this[this.length - 1];
};
