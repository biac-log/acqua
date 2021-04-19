import { SecteurDTO, Secteur } from '@/models/Secteur/Secteur';
import api from '@/api/AxiosApi';

export default abstract class CompteApi {
  static async getAllSecteurs(): Promise<Secteur[]> {
    const response = await api.AcQuaCore.get<SecteurDTO[]>('Secteurs');
    return response.data.map((SecteurDTO) => new Secteur(SecteurDTO));
  }

  static async searchSecteursByCode(code: number, nbrElement: number): Promise<Secteur[]> {
    const response = await api.AcQuaCore.get<SecteurDTO[]>(`Secteurs?code=${code}&nbrElement=${nbrElement}`);
    return response.data.map((SecteurDTO) => new Secteur(SecteurDTO));
  }
}
