import { Societe } from '@/models/Societe/societe';
import api from '@/api/AxiosApi';
import { SocieteGen } from '@/models/Societe/SocieteGen';

export default abstract class SocietesApi {
  static async getSocietes(): Promise<Societe[]> {
    const response = await api.AcQuaCore.get<Societe[]>(`Societes`);
    return response.data.map((societeDTO) => new Societe(societeDTO));
  }

  static async createSociete(societe: Societe): Promise<boolean> {
    const response = await api.AcQuaCore.post<boolean>(`Societes`, societe);
    return response.data;
  }

  static async updateSociete(societe: Societe, hash: string): Promise<boolean> {
    const data = {
      'updatedModel': societe,
      'hashOldModel': hash
    };
    const response = await api.AcQuaCore.put<boolean>(`Societes`, data);
    return response.data;
  }

  static async checkSocieteExiste(identifiant: string): Promise<boolean> {
    const response = await api.AcQuaCore.get<boolean>(`Societes/${identifiant}`);

    return response.data;
  }

  static async getDirectories(): Promise<SocieteGen[]> {
    const response = await api.AcQuaCore.get<string[]>(`Societes/Dossiers/Get`);

    return response.data.map((s) => new SocieteGen(s));
  }
}
