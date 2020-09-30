import { FamilleDTO, Famille } from '@/models/Famille/Famille';
import api from '@/api/AxiosApi';

export default abstract class CompteApi {
  static async getAllFamilles(type: string): Promise<Famille[]> {
    const response = await api.AcQuaCore.get<FamilleDTO[]>(`familles?type=${type}`);
    return response.data.map((FamilleDTO) => new Famille(FamilleDTO));
  }

  static async searchFamillesByCode(code: number, nbrElement: number, type: string): Promise<Famille[]> {
    const response = await api.AcQuaCore.get<FamilleDTO[]>(`familles?code=${code}&nbrElement=${nbrElement}&type=${type}`);
    return response.data.map((FamilleDTO) => new Famille(FamilleDTO));
  }
}
