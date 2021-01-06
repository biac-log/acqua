import { Societe, SocieteDTO } from '@/models/Societe/societe';
import api from '@/api/AxiosApi';

export default abstract class SocietesApi {
  static async getSocietes(): Promise<Societe[]> {
    const response = await api.AcQuaCore.get<Societe[]>(`Societes`);
    return response.data.map((societeDTO) => new Societe(societeDTO));
  }

  static async createSocietes(societe: Societe): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>(`Societes`);
    return response.data;
  }

  static async updateSocietes(): Promise<boolean> {
    const response = await api.AcQuaCore.get<boolean>(`Societes`);
    return response.data;
  }
}
