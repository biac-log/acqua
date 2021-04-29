import { PeriodeComptable } from "@/models/OperationDiverse/PeriodeComptable"
import { PeriodeComptableDTO } from "../AchatVente";

export class ResultatsComptablesDTO {
    public structureName = '';
    public compteBilan = false;
    public compteResultat = false;
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
  