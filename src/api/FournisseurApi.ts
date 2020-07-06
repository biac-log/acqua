import Axios from "axios";
import {SearchFournisseur, SearchFournisseurDTO} from "@/models/Fournisseur/SearchFournisseur"
import {JournalDTO, Journal, PeriodeComptable, PeriodeComptableDTO, EntetePieceComptable, EntetePieceComptableDTO, Piece, PieceDTO, TypeCompte, TypeCompteDTO} from "@/models/Financier";
import { UserModule } from "@/store/modules/user";
import { Pagination } from '@/models/Pagination';
import { PaginationResult } from '@/models/PaginationResult';
import { Reglement, ReglementDTO } from '@/models/Financier/Get/Reglement';
import { filter } from 'vue/types/umd';

export abstract class FournisseurApi {
    private static axios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }}); 

    static async getSearchFournisseurs(): Promise<SearchFournisseur[]> {
        let response = await this.axios.get<SearchFournisseurDTO[]>(
          `${process.env.VUE_APP_ApiAcQuaCore}Fournisseur/GetSearchFournisseurs`);
        return response.data.map(
          searchFDTO => new SearchFournisseur(searchFDTO)
        );
    }

    static async GetEntetePiecesComptables(pagination: Pagination): Promise<PaginationResult<SearchFournisseur>>{
      let response = await this.axios.get<PaginationResult<SearchFournisseur>>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&SortByAsc=${pagination.sortDesc}`);
      return response.data;
    }
}