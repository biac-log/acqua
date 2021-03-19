import { DateTime } from '@/models/DateTime';
import { DetailEcriture, DetailEcritureDTO } from '@/models/HistoriqueComptable/DetailEcriture';
import { HistoriqueComptable, HistoriqueComptableDTO } from '@/models/HistoriqueComptable/HistoriqueComptable';
import api from './AxiosApi';

export default abstract class HistoriqueComptableApi {
  static async getHistorique(
    typeCompte: string,
    numeroCompte: number,
    fromDate: string,
    toDate: string
  ): Promise<HistoriqueComptable> {
    const response = await api.AcQuaCore.get<HistoriqueComptableDTO>(
      `/HistoriqueComptable?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}&startDate=${fromDate ?? ''}&endDate=${toDate ?? ''}`
    );
    return new HistoriqueComptable(response.data);
  }

  static async getDetailEcriture(
    journal: number,
    piece: number
  ): Promise<DetailEcriture> {
    const response = await api.AcQuaCore.get<DetailEcritureDTO>(
      `/HistoriqueComptable/Detail?journal=${journal}&piece=${piece}`
    );
    return new DetailEcriture(response.data);
  }
}
