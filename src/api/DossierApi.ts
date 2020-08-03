import Axios from "axios";
import { UserModule } from "@/store/modules/user";
import { DossierSearch, DossierSearchDTO } from "@/models/Dossier/DossierSearch";

export abstract class DossierApi {
  private static axios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getAll(): Promise<DossierSearch[]> {
    let response = await this.axios.get<DossierSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Dossier/GetAllDossiers`);
    return response.data.map(d => new DossierSearch(d));
  }

  static async getsById(id: string, limit: number): Promise<DossierSearch[]> {
    let response = await this.axios.get<DossierSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Dossier/GetDossiersById?startId=${id}&nbrElement=${limit}`);
    return response.data.map(d => new DossierSearch(d));
  }

  static async getById(id: string): Promise<DossierSearch> {
    let response = await this.axios.get<DossierSearchDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Dossier/GetDossierById?id=${id}`);
    return new DossierSearch(response.data);
  }
}