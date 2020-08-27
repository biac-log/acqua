import { Departement, DepartementDTO } from '@/models/GestionUtilisateur/Departement';
import api from './AxiosApi';

export default abstract class DepartementApi {
  static async getDepartements(): Promise<Departement[]> {
    const response = await api.AcQuaCore.get<DepartementDTO[]>(`Departement/GetAll?typeAcces=SQLServer`);
    return response.data.map((dep) => new Departement(dep));
  }
}
