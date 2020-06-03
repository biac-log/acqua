import Axios from "axios";
import CompteSearch, { CompteSearchDTO } from "@/models/Compte/CompteSearch";
import CompteGeneralSearch, {
  CompteGeneralSearchDTO
} from "@/models/Compte/CompteGeneralSearch";
import { CompteDeTierDTO, CompteDeTier } from "@/models/Compte/CompteDeTier";

export abstract class CompteApi {
  private static CompteAxios = Axios.create();

  static async getComptesTiers(type: string): Promise<CompteSearch[]> {
    let response = await this.CompteAxios.get<CompteSearchDTO[]>(
      `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesDeTiers?typeCompte=${type}`
    );
    return response.data.map(
      CompteSearchDTO => new CompteSearch(CompteSearchDTO)
    );
  }

  static async getCompteDeTier(
    type: string,
    numero: string
  ): Promise<CompteDeTier> {
    let response = await this.CompteAxios.get<CompteDeTierDTO>(
      `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetCompteDeTiersById?typeCompte=${type}&numeroCompte=${numero}`
    );
    return new CompteDeTier(response.data);
  }

  static async searchCompteDeTier(type: string, matchcode: string, nbrElement: number): Promise<CompteSearch[]> {
    let response = await this.CompteAxios.get<CompteSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetComptesDeTiersByMatchcode?typeCompte=${type}&matchcode=${matchcode}&nbrElement=${nbrElement}`);
    return response.data.map(CompteSearchDTO => new CompteSearch(CompteSearchDTO));
  }

  static async getComptesGeneraux(
    type: string
  ): Promise<CompteGeneralSearch[]> {
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO[]>(
      `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesGeneraux?typeCompte=${type}`
    );
    return response.data.map(
      CompteSearchDTO => new CompteGeneralSearch(CompteSearchDTO)
    );
  }

  static async getCompteGeneral(
    type: string,
    numero: string
  ): Promise<CompteGeneralSearch> {
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO>(
      `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetCompteGeneralById?typeCompte=${type}&numeroCompte=${numero}`
    );
    return new CompteGeneralSearch(response.data);
  }

  static async autocompleteCompteByMatchCode(type: string, matchcode: string, nbrElement: number): Promise<CompteGeneralSearch[]> {
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetComptesByMatchcode?typeCompte=${type}&matchcode=${matchcode}&nbrElement=${nbrElement}`);
    return response.data.map(CompteSearchDTO => new CompteGeneralSearch(CompteSearchDTO));
  }

  static async autocompleteCompteByNumero(type: string, numero: string, nbrElement: number): Promise<CompteGeneralSearch[]> {
    let response = await this.CompteAxios.get<CompteGeneralSearchDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetComptesByNumero?typeCompte=${type}&startNumero=${numero}&nbrElement=${nbrElement}`);
    return response.data.map(CompteSearchDTO => new CompteGeneralSearch(CompteSearchDTO));
  }
}
