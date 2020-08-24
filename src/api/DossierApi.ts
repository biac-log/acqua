import { DossierSearch, DossierSearchDTO } from '@/models/Dossier/DossierSearch';
import api from './AxiosApi';

export abstract class DossierApi {
  static async getAll(): Promise<DossierSearch[]> {
    const response = await api.AcQuaCore.get<DossierSearchDTO[]>(`/Dossier/GetAllDossiers`);
    return response.data.map((d) => new DossierSearch(d));
  }

  static async getsById(id: string, limit: number): Promise<DossierSearch[]> {
    const response = await api.AcQuaCore.get<DossierSearchDTO[]>(
      `/Dossier/GetDossiersById?startId=${id}&nbrElement=${limit}`
    );
    return response.data.map((d) => new DossierSearch(d));
  }

  static async getById(id: string): Promise<DossierSearch> {
    const response = await api.AcQuaCore.get<DossierSearchDTO>(`/Dossier/GetDossierById?id=${id}`);
    return new DossierSearch(response.data);
  }
}
