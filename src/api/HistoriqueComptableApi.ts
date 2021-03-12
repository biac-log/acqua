import { DateTime } from '@/models/DateTime';
import { HistoriqueComptable, HistoriqueComptableDTO } from '@/models/HistoriqueComptable/HistoriqueComptable';
import api from './AxiosApi';

export default abstract class HistoriqueComptableApi {
  static async getHistorique(
    typeCompte: string,
    numeroCompte: number,
    fromDate: string,
    toDate: string
  ): Promise<HistoriqueComptable> {
    const response = await api.AcQuaCore.get<HistoriqueComptable>(
      `/HistoriqueComptable?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}&startDate=${fromDate}&endDate=${toDate}`
    );
    return response.data;
  }
}
