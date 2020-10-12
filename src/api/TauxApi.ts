import { Taux, TauxDTO } from '@/models/Taux/Taux';
import api from './AxiosApi';

export default abstract class TauxApi {
  static async getAllTaux(): Promise<Taux[]> {
    const response = await api.AcQuaCore.get<TauxDTO[]>(`/Taux`);
    return response.data.map((taux) => new Taux(taux));
  }

  static async getTaux() {
    console.log('getTaux');
  }

  static async createTaux(taux: Taux): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>('/taux', taux);

    return response.data;
  }
}
