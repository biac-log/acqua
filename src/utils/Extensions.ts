interface Number {
  toDecimalString(nbDecimal?: number): string;
  toIntString(): string;
  toComptaString(nbDecimal?: number): string;
  montantNegatifString(nbDecimal?: number): string;
}

interface String {
  isInt(required?: boolean): boolean;
  isDecimal(required?: boolean): boolean;
  toNumber(): number;
}

Number.prototype.toDecimalString = function(nbDecimal = 2) {
  if (!nbDecimal) nbDecimal = 2;

  if (!this) return '';
  else return Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+this);
};

Number.prototype.toIntString = function() {
  if (!this) return '';
  else return Intl.NumberFormat('fr-FR').format(this as number);
};

Number.prototype.toComptaString = function(nbDecimal = 2) {
  if (!nbDecimal) nbDecimal = 2;
  if (!this) return '';
  else {
    if (+this >= 0)
      return Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(+this));
    else
      return `${Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Math.abs(+this)
      )}-`;
  }
};

Number.prototype.montantNegatifString = function(nbDecimal = 2) {
  if (!nbDecimal) nbDecimal = 2;
  if (!this) return '';
  else {
    if (+this >= 0)
      return Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(+this));
    else
      return `-${Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Math.abs(+this)
      )}`;
  }
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
