import { CaseTva, CaseTvaDTO } from '@/models/CaseTva/CaseTva';
import api from '@/api/AxiosApi';
import { CaseTvaMaintenance, CaseTvaMaintenanceDTO } from '@/models/CaseTva/CaseTvaMaintenance';
import { CaseTvaNature } from '@/models/CaseTva/CaseTvaNature';

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

  static async create(item: CaseTvaMaintenance): Promise<boolean> {
    await api.AcQuaCore.post<boolean>('/casetva', item);

    return true;
  }

  static async update(updatedModel: CaseTvaMaintenance, hashOldModel: string): Promise<boolean> {
    const data = {
      updatedModel,
      hashOldModel
    };
    const response = await api.AcQuaCore.put<boolean>('/casetva', data);

    return response.data;
  }

  static async getNatures(): Promise<CaseTvaNature[]> {
    const response = await api.AcQuaCore.get<CaseTvaNature[]>('/casetva/natures');

    return response.data;
  }
}
