import Axios from "axios";
import { UserModule } from "@/store/modules/user";
import { DossierSearch, DossierSearchDTO } from "@/models/Dossier/DossierSearch";
import api from "./AxiosApi"

export abstract class DossierApi {
  static async getAll(): Promise<DossierSearch[]> {
    let response = await api.AcQuaCore.get<DossierSearchDTO[]>(`/Dossier/GetAllDossiers`);
    return response.data.map(d => new DossierSearch(d));
  }

  static async getsById(id: string, limit: number): Promise<DossierSearch[]> {
    let response = await api.AcQuaCore.get<DossierSearchDTO[]>(`/Dossier/GetDossiersById?startId=${id}&nbrElement=${limit}`);
    return response.data.map(d => new DossierSearch(d));
  }

  static async getById(id: string): Promise<DossierSearch> {
    let response = await api.AcQuaCore.get<DossierSearchDTO>(`/Dossier/GetDossierById?id=${id}`);
    return new DossierSearch(response.data);
  }
}