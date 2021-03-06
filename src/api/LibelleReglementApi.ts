import { LibelleReglement, LibelleReglementDTO } from '@/models/LibelleReglement/LibelleReglement';
import api from './AxiosApi';

export default abstract class LibelleReglementApi {
  static async getAll(): Promise<LibelleReglement[]> {
    const response = await api.AcQuaCore.get<LibelleReglementDTO[]>(`/parametres/libellesreglement`);
    return response.data.map((l) => new LibelleReglement(l));
  }

  static async create(item: LibelleReglement): Promise<boolean> {
    await api.AcQuaCore.post<boolean>('/parametres/libellesreglement', item);

    return true;
  }

  static async update(updatedLibelleReglement: LibelleReglement, hashOldModel: string): Promise<boolean> {
    const data = {
      updatedModel: updatedLibelleReglement,
      hashOldModel
    };
    const response = await api.AcQuaCore.put<boolean>('/parametres/libellesreglement', data);

    return response.data;
  }
}
