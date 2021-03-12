import { DateTime } from '../DateTime';
import { Imputation } from './Imputation';

export class HistoriqueComptableDTO {
    solde = 0;
    fromDate: DateTime = new DateTime();
    imputations: Imputation[] = [];
}

export class HistoriqueComptable extends HistoriqueComptableDTO {
  constructor(dto?: HistoriqueComptableDTO) {
    super();
    Object.assign(this, dto || new HistoriqueComptableDTO());
  }

  public static rules = {
    numero: [(v: string) => !v || !!v.toNumber() || v.toNumber() > 1 || v.toNumber() < 99 || 'Nombre invalide']
  };
}
