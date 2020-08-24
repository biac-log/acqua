import { CaseTva, CaseTvaDTO } from '@/models/CaseTva/CaseTva';
import api from '@/api/AxiosApi';

export abstract class CaseTvaApi {
  static async getCasesTVADisponibles(journal: number | string): Promise<CaseTva[]> {
    const response = await api.AcQuaCore.get<CaseTva[]>(`CaseTVA/GetCasesTVADisponibles?numeroJournal=${journal}`);
    return response.data.map((caseTvaDTO) => new CaseTva(caseTvaDTO));
  }

  static async getCaseTVA(numeroCase: number | string, numeroJournal: number | string): Promise<CaseTva> {
    const response = await api.AcQuaCore.get<CaseTvaDTO>(
      `CaseTVA/GetCaseTVA?numeroCase=${numeroCase}&numeroJournal=${numeroJournal}`
    );
    return new CaseTva(response.data);
  }
}
