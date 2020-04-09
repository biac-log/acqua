import Axios from "axios";
import CompteSearch, {CompteSearchDTO} from "@/models/Compte/CompteSearch";
import CompteGeneralSearch, {CompteGeneralSearchDTO} from "@/models/Compte/CompteGeneralSearch";

export abstract class CompteApi {
  private static CompteAxios = Axios.create();

  static async getComptesTiers(type:string): Promise<CompteSearch[]>{
    let response = await this.CompteAxios.get<CompteSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesDeTiers?typeCompte=${type}`);
    return response.data.map(CompteSearchDTO => new CompteSearch(CompteSearchDTO));
  }

  static async getCompteTier(type:string, numero:string): Promise<CompteSearch>{
    let response = await this.CompteAxios.get<CompteSearchDTO>(`${process.env.VUE_APP_ApiAcQuaCore}​/Compte​/GetCompteDeTiersById?typeCompte=${type}&numeroCompte=${numero}`);
    return new CompteSearch(response.data);
  }

  static async getComptesGeneraux(type:string): Promise<CompteGeneralSearch[]>{
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesGeneraux?typeCompte=${type}`);
    return response.data.map(CompteSearchDTO => new CompteGeneralSearch(CompteSearchDTO));
  }

  static async getCompteGeneral(type:string, numero:string): Promise<CompteGeneralSearch>{
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetCompteGeneralById?typeCompte=${type}&numeroCompte=${numero}`);
    return new CompteGeneralSearch(response.data);
  }
}