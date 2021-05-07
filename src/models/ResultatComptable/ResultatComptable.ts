import { PeriodeComptable } from "@/models/OperationDiverse/PeriodeComptable"
import { PeriodeComptableDTO } from "../AchatVente";

export class ResultatsComptablesDTO {
    public structureName = '';
    public Bilan = false;
    public compteResultat = false;
    public DebutPeriode1 = '';
    public FinPeriode1 = '';
    public DebutPeriode2 = '';
    public FinPeriode2 = '';
    public periode1 : PeriodeComptableDTO = new PeriodeComptableDTO();
    public periode2 : PeriodeComptableDTO = new PeriodeComptableDTO();
  }
  
  export class ResultatsComptables extends ResultatsComptablesDTO {
    constructor(dto?: ResultatsComptablesDTO) {
      super();
      Object.assign(this, dto || new ResultatsComptablesDTO());
    }

    getPeriode() : PeriodeComptable {
        return new PeriodeComptable();
    }
  }
  