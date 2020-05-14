
interface Number {
  toDecimalString(nbDecimal: number | undefined): string;
  toIntString(): string;
}

interface String {
  isInt(required?: boolean): boolean;
  isDecimal(required?: boolean): boolean;
  toNumber(): number;
}

Number.prototype.toDecimalString = function (nbDecimal: number = 2) {
  if(!nbDecimal) nbDecimal = 2;
  
  if(!this) return ''; 
  else return Intl.NumberFormat("fr-FR", {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(+this);
}

Number.prototype.toIntString = function () { 
  if(!this) return ''; 
  else return Intl.NumberFormat("fr-FR").format(this as number);
}

String.prototype.isInt = function (required: boolean = false) {
  if(!this)
    return !required;   
  else {
    let number = this.toString();
    return !isNaN(parseInt(number)) && isFinite(+number);
  }
}

String.prototype.isDecimal = function (required: boolean = false) { 
  if(!this)
    return !required;   
  else {
    let number = this.replace(/\./g, '').replace(',', '.');
    return !isNaN(parseFloat(number)) && isFinite(+number);
  }
}

String.prototype.toNumber = function () {
    let number = +this;
    if(number || number == 0)
      return number;
    else return +this.replace(/\./g, '').replace(',', '.');
}