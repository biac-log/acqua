import { Societe, SocieteDTO } from '@/models/Societe/societe';
import api from '@/api/AxiosApi';

export default abstract class SocietesApi {
  static async getSocietes(): Promise<Societe[]> {
    const response = await api.AcQuaCore.get<Societe[]>(`Societes`);
    return response.data.map((societeDTO) => new Societe(societeDTO));
  }

  static async createSociete(societe: Societe): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>(`Societes`, societe);
    return response.data;
  }

  static async updateSociete(): Promise<boolean> {
    const response = await api.AcQuaCore.get<boolean>(`Societes`);
    return response.data;
  }

  static async checkSocieteExiste(identifiant: string): Promise<boolean> {
    const response = await api.AcQuaCore.get<boolean>(`Societes/${identifiant}`);

    return response.data;
  }
}
