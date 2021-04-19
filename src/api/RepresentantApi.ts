import { RepresentantDTO, Representant } from '@/models/Representant/Representant';
import api from '@/api/AxiosApi';

export default abstract class CompteApi {
  static async getAllRepresentants(): Promise<Representant[]> {
    const response = await api.AcQuaCore.get<RepresentantDTO[]>('representants');
    return response.data.map((RepresentantDTO) => new Representant(RepresentantDTO));
  }

  static async searchRepresentantsByCode(code: number, nbrElement: number): Promise<Representant[]> {
    const response = await api.AcQuaCore.get<RepresentantDTO[]>(`representants?code=${code}&nbrElement=${nbrElement}`);
    return response.data.map((RepresentantDTO) => new Representant(RepresentantDTO));
  }
}
