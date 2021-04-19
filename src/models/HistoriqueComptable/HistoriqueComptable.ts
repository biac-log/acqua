import { DateTime } from '../DateTime';
import { Imputation } from './Imputation';

export class HistoriqueComptableDTO {
    solde = 0;
    devise = '';
    fromDate: DateTime = new DateTime();
    toDate: DateTime = new DateTime();
    imputations: Imputation[] = [];
}

export class HistoriqueComptable extends HistoriqueComptableDTO {
  constructor(dto?: HistoriqueComptableDTO) {
    super();
    Object.assign(this, dto || new HistoriqueComptableDTO());
    if (dto) {
      this.imputations = [];
      dto.imputations.forEach((element) => {
        this.imputations.push(new Imputation(element));
      });
    }
  }

  public static rules = {
    numero: [(v: string) => !v || !!v.toNumber() || v.toNumber() > 1 || v.toNumber() < 99 || 'Nombre invalide']
  };
}
