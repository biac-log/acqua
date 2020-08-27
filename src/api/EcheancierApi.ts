import { Echeancier, EcheancierDTO } from '@/models/Echeancier';
import api from './AxiosApi';

export default abstract class EcheancierApi {
  static async getEcheancierForCompteTiers(typeCompte: string, numeroCompte: string): Promise<Echeancier> {
    const response = await api.AcQuaCore.get<EcheancierDTO>(
      `/Echeancier/GetEcheancierForCompteTiers?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}`
    );
    return new Echeancier(response.data);
  }
}
