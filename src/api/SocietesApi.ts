import { Societe, SocieteDTO } from '@/models/Societe/societe';
import api from '@/api/AxiosApi';

export default abstract class SocietesApi {
  static async getSocietes(): Promise<Societe[]> {
    const response = await api.AcQuaCore.get<Societe[]>(`Societes`);
    return response.data.map((societeDTO) => new Societe(societeDTO));
  }
}
