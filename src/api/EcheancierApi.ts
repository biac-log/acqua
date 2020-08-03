

import Axios from "axios";
import { EcheancierDTO, Echeancier } from '@/models/Echeancier';


export abstract class EcheancierApi {
  private static axios = Axios.create();

  static async getEcheancierForCompteTiers(typeCompte: string, numeroCompte: string): Promise<Echeancier> {
    let response = await this.axios.get<EcheancierDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Echeancier/GetEcheancierForCompteTiers?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}`);
    return new Echeancier(response.data);
  }
}
