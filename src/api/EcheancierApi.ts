

import Axios from "axios";
import { EcheancierDTO, Echeancier } from '@/models/Echeancier';
import api from "./AxiosApi";

export abstract class EcheancierApi {
  static async getEcheancierForCompteTiers(typeCompte: string, numeroCompte: string): Promise<Echeancier> {
    let response = await api.AcQuaCore.get<EcheancierDTO>(`/Echeancier/GetEcheancierForCompteTiers?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}`);
    return new Echeancier(response.data);
  }
}
