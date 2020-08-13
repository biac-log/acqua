import Axios from "axios";
import {SearchFournisseur, SearchFournisseurDTO} from "@/models/Fournisseur/SearchFournisseur"
import { UserModule } from "@/store/modules/user";
import { Pagination } from '@/models/Pagination';
import { PaginationResult } from '@/models/PaginationResult';
import api from "./AxiosApi";

export abstract class FournisseurApi {
    static async getSearchFournisseurs(): Promise<SearchFournisseur[]> {
        let response = await api.AcQuaCore.get<SearchFournisseurDTO[]>(
          `Fournisseur/GetSearchFournisseurs`);
        return response.data.map(
          searchFDTO => new SearchFournisseur(searchFDTO)
        );
    }

    static async GetEntetePiecesComptables(pagination: Pagination): Promise<PaginationResult<SearchFournisseur>>{
      let response = await api.AcQuaCore.get<PaginationResult<SearchFournisseur>>(`/AchatVente/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&SortByAsc=${pagination.sortDesc}`);
      return response.data;
    }
}