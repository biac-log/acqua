import { CompteSearchDTO, CompteSearch } from '@/models/Compte/CompteSearch';
import { CompteGeneralSearchDTO, CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import { CompteDeTierDTO, CompteDeTier } from '@/models/Compte/CompteDeTier';
import api from '@/api/AxiosApi';

export default abstract class CompteApi {
  static async getComptesTiers(type: string): Promise<CompteSearch[]> {
    const response = await api.AcQuaCore.get<CompteSearchDTO[]>(`Compte/GetAllComptesDeTiers?typeCompte=${type}`);
    return response.data.map((CompteSearchDTO) => new CompteSearch(CompteSearchDTO));
  }

  static async getCompteDeTier(type: string, numero: string): Promise<CompteDeTier> {
    const response = await api.AcQuaCore.get<CompteDeTierDTO>(
      `Compte/GetCompteDeTiersById?typeCompte=${type}&numeroCompte=${numero}`
    );
    return new CompteDeTier(response.data);
  }

  static async searchCompteDeTier(type: string, matchcode: string, nbrElement: number): Promise<CompteSearch[]> {
    const response = await api.AcQuaCore.get<CompteSearchDTO[]>(
      `Compte/GetComptesDeTiersByMatchcode?typeCompte=${type}&matchcode=${matchcode}&nbrElement=${nbrElement}`
    );
    return response.data.map((CompteSearchDTO) => new CompteSearch(CompteSearchDTO));
  }

  static async getComptesGeneraux(type: string): Promise<CompteGeneralSearch[]> {
    const response = await api.AcQuaCore.get<CompteGeneralSearchDTO[]>(
      `Compte/GetAllComptesGeneraux?typeCompte=${type}`
    );
    return response.data.map((CompteSearchDTO) => new CompteGeneralSearch(CompteSearchDTO));
  }

  static async searchComptesGeneraux(type: string): Promise<CompteSearch[]> {
    const response = await api.AcQuaCore.get<CompteSearchDTO[]>(`Compte/GetAllComptesGeneraux?typeCompte=${type}`);
    return response.data.map((CompteSearchDTO) => new CompteSearch(CompteSearchDTO));
  }

  static async getCompteGeneral(type: string, numero: string): Promise<CompteGeneralSearch> {
    const response = await api.AcQuaCore.get<CompteGeneralSearchDTO>(
      `Compte/GetCompteGeneralById?typeCompte=${type}&numeroCompte=${numero}`
    );
    return new CompteGeneralSearch(response.data);
  }

  static async autocompleteCompteByMatchCode(
    type: string,
    matchcode: string,
    nbrElement: number
  ): Promise<CompteGeneralSearch[]> {
    const response = await api.AcQuaCore.get<CompteGeneralSearchDTO[]>(
      `Compte/GetComptesByMatchcode?typeCompte=${type}&matchcode=${matchcode}&nbrElement=${nbrElement}`
    );
    return response.data.map((CompteSearchDTO) => new CompteGeneralSearch(CompteSearchDTO));
  }

  static async autocompleteCompteByNumero(
    type: string,
    numero: string,
    nbrElement: number
  ): Promise<CompteGeneralSearch[]> {
    const response = await api.AcQuaCore.get<CompteGeneralSearchDTO[]>(
      `Compte/GetComptesByNumero?typeCompte=${type}&startNumero=${numero}&nbrElement=${nbrElement}`
    );
    return response.data.map((CompteSearchDTO) => new CompteGeneralSearch(CompteSearchDTO));
  }
}
