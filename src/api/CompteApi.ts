import Axios from "axios";
import CompteSearch, {CompteSearchDTO} from "@/models/CompteSearch";

export abstract class CompteApi {
  private static CompteAxios = Axios.create();

  static async getByType(type:string): Promise<CompteSearch[]>{
    let response = await this.CompteAxios.get<CompteSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesByType?typeCompte=${type}`);
    return response.data.map(CompteSearchDTO => new CompteSearch(CompteSearchDTO));
  }

  static async get(type:string, numero:string): Promise<CompteSearch>{
    let response = await this.CompteAxios.get<CompteSearchDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetCompteById?typeCompte=${type}&numeroCompte=${numero}`);
    return new CompteSearch(response.data);
  }
}