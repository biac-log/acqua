import { CaseTva, CaseTvaDTO } from '@/models/CaseTva/CaseTva';
import api from '@/api/AxiosApi';
import { CaseTvaMaintenance, CaseTvaMaintenanceDTO } from '@/models/CaseTva/CaseTvaMaintenance';
import { CreateCaseTva } from '@/models/CaseTva/CreateCaseTva';

export default abstract class CaseTvaApi {
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

  static async getAll(): Promise<CaseTvaMaintenance[]> {
    const response = await api.AcQuaCore.get<CaseTvaMaintenanceDTO[]>(`CaseTVA`);
    return response.data.map((caseTvaDTO) => new CaseTvaMaintenance(caseTvaDTO));
  }

  static async create(item: CreateCaseTva): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>('/casetva', item);

    return true;
  }
}
