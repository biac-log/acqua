import { Taux, TauxDTO } from '@/models/Taux/Taux';
import api from './AxiosApi';

export default abstract class TauxApi {
  static async getAllTaux(): Promise<Taux[]> {
    const response = await api.AcQuaCore.get<TauxDTO[]>(`/Taux`);
    return response.data.map((taux) => new Taux(taux));
  }

  static async createTaux(taux: Taux): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>('/taux', taux);

    return response.data;
  }

  static async update(updatedTaux: Taux, hashOldModel: string): Promise<boolean> {
    const data = {
      updatedTaux,
      hashOldModel
    };
    const response = await api.AcQuaCore.put<boolean>('/taux', data);

    return response.data;
  }
}
