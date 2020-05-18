import Axios from "axios";
import { Departement, DepartementDTO } from "@/models/GestionUtilisateur/Departement";
import { UserModule } from "@/store/modules/user";

export abstract class DepartementApi {
  private static DepartementAxios = Axios.create();

  static async getDepartements(): Promise<Departement[]> {
    let response = await this.DepartementAxios.get<DepartementDTO[]>(`${process.env.VUE_APP_ApiAcQua}/Departement/GetAll?typeAcces=SQLServer`);
    return response.data.map(dep => new Departement(dep));
  }  
}
