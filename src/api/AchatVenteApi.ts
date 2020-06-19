import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import moment from "moment";
import { UserModule } from "@/store/modules/user";

import {
  PieceComptableDTO,
  PieceComptable,
  TypeCompte,
  TypeCompteDTO,
  CompteContrepartieSearchDTO,
  CompteContrepartieSearch,
  PeriodeComptableDTO,
  PeriodeComptable,
  EntetePieceComptableDTO,
  EntetePieceComptable,
  Statut,
  Devise,
  Journal,
  JournalDTO
} from "@/models/AchatVente";
import CompteGeneralSearch from '@/models/Compte/CompteGeneralSearch';
import { PieceComptableSaveDTO } from '@/models/AchatVente';
import * as DateMethods from '@/utils/DateMethods'
import { DateTime } from '@/models/DateTime';
import { PaginationResult } from '@/models/PaginationResult';
import { Pagination } from '@/models/Pagination';

export abstract class AchatVenteApi {
  private static achatVenteAxios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getPeriodes(): Promise<PeriodeComptable[]>{
    let responseCourante = await this.achatVenteAxios.get<PeriodeComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetPeriodeCourante`);
    let responsePrecedente = await this.achatVenteAxios.get<PeriodeComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetPeriodePrecedente`);
    let periodes: PeriodeComptable[] = [];
    periodes.push(new PeriodeComptable(responseCourante.data));
    periodes.push(new PeriodeComptable(responsePrecedente.data));
    return periodes;
  }

  static async getJournaux(): Promise<Journal[]>{
    let response = await this.achatVenteAxios.get<JournalDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetJournaux`);
    return response.data.map(journal => new Journal(journal));
  }

  static async GetEntetePiecesComptables(numeroJournal: number, periode: string, pagination: Pagination): Promise<PaginationResult<EntetePieceComptable>>{
    let response = await this.achatVenteAxios.get<PaginationResult<EntetePieceComptable>>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&SortByAsc=${pagination.sortDesc}&NumeroJournal=${numeroJournal}&Periode=${periode}`);
    return response.data;
  }

  static async getDateEcheance(
    typeCompte: string,
    numeroCompte: number | string,
    date: DateTime
  ): Promise<DateTime> {
    let response = await this.achatVenteAxios.get<string>(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetDateEcheance?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}&datePiece=${date.toUtc()}`
    );
    return new DateTime(response.data);
  }

  static async getPieceComptable(
    numeroJournal: string | number,
    numeroPiece: string | number
  ): Promise<PieceComptable> {
    let response = await this.achatVenteAxios.get<PieceComptableDTO>(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetPieceComptable?journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return new PieceComptable(response.data);
  }

  static async getTypesComptes(): Promise<TypeCompte[]> {
    let response = await this.achatVenteAxios.get<TypeCompteDTO[]>(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetTypesCompteContreparties`
    );
    return response.data.map(TypeCompteDTO => new TypeCompte(TypeCompteDTO));
  }

  static async getComptesContreparties(): Promise<CompteContrepartieSearch[]> {
    let response = await this.achatVenteAxios.get<
      CompteContrepartieSearchDTO[]
    >(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetTypesCompteContreparties`
    );
    return response.data.map(
      TypeCompteDTO => new CompteContrepartieSearch(TypeCompteDTO)
    );
  }

  static async getAllStatut(): Promise<Statut[]> {
    let response = await this.achatVenteAxios.get<Statut[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetStatuts`);
    return response.data;
  }

  static async getCompteTva(numeroJournal: number | string, codeTaxe: string | number, codePays?: string): Promise<CompteGeneralSearch> {
    let response = await this.achatVenteAxios.get<CompteGeneralSearch>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetCompteTVA?numeroJournal=${numeroJournal}&codePays=${codePays}&codeTaxeCompteTiers=${codeTaxe}`);
    return response.data;
  }

  static async AddPiece(pieceComptable: PieceComptableSaveDTO): Promise<number> {
    let response = await this.achatVenteAxios.post<number>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/AddPieceComptable`, pieceComptable);
    return response.data;
  }

  static async UpdatePiece(pieceComptable: PieceComptableSaveDTO): Promise<PieceComptableSaveDTO> {
    let response = await this.achatVenteAxios.put<PieceComptableSaveDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/UpdatePieceComptable`, pieceComptable);
    return response.data;
  }

  static async DeletePiece(periode: string, journal: number, piece: number): Promise<any> {
    let response = await this.achatVenteAxios.delete<any>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/DeletePieceComptable?periode=${periode}&journal=${journal}&piece=${piece}`);
    return response.data;
  }

  static async ValidateLibelle(libelle: string, typeComte: string, numeroCompte: string | number): Promise<boolean>{
    let response = await this.achatVenteAxios.get<boolean>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/IsReferenceExiste?typeCompte=${typeComte}&numeroCompte=${numeroCompte}&reference=${libelle}`);
    return response.data;
  }

  static async ChangeNumero(periode: string, journal: number, oldNumero: number, newNumero: number): Promise<boolean>{
    await this.achatVenteAxios.put(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/ChangementNumero?periode=${periode}&numeroJournal=${journal}&ancienNumeroPiece=${oldNumero}&nouveauNumeroPiece=${newNumero}`);
    return true;
  }
}