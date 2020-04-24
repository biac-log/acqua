import Axios from "axios";
import moment from "moment"

import {
  PieceComptableDTO,
  PieceComptable,
  TypeCompte,
  TypeCompteDTO,
  CompteContrepartieSearchDTO,
  CompteContrepartieSearch,
  CaseTva,
  CaseTvaDTO,
  PeriodeComptableDTO,
  PeriodeComptable,
  EntetePieceComptableDTO,
  EntetePieceComptable,
  Statut,
  Devise
} from "@/models/AchatVente";
import CompteGenerealSearch from '@/models/Compte/CompteGeneralSearch';
import { PieceComptableSaveDTO } from '@/models/AchatVente';
import * as DateMethods from '@/utils/DateMethods'
import { DateTime } from '@/models/DateTime';

export abstract class AchatVenteApi {
  private static achatVenteAxios = Axios.create();

  static async getPeriodeComptable(periode: string) : Promise<PeriodeComptable>{
    let response = await this.achatVenteAxios.get<PeriodeComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetPeriode${periode}`);
    return new PeriodeComptable(response.data);
  }

  static async GetEntetePiecesComptables(numeroJournal: number, periode: string): Promise<EntetePieceComptable[]>{
    let response = await this.achatVenteAxios.get<EntetePieceComptableDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetEntetePiecesComptables?journal=${numeroJournal}&stPeriode=${periode}`);
    return response.data.map(entete => new EntetePieceComptable(entete));
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

  static async getCasesTVADisponibles(journal: number | string): Promise<CaseTva[]> {
    let response = await this.achatVenteAxios.get<
    CaseTva[]
    >(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetCasesTVADisponibles?numeroJournal=${journal}`
    );
    return response.data.map(
      caseTvaDTO => new CaseTva(caseTvaDTO)
    );
  }

  static async getCaseTVA(numeroCase: number | string, numeroJournal : number | string): Promise<CaseTva> {
    let response = await this.achatVenteAxios.get<CaseTvaDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetCaseTVA?numeroCase=${numeroCase}&numeroJournal=${numeroJournal}`);
    return new CaseTva(response.data);
  }

  static async getDevises(): Promise<CaseTva> {
    let response = await this.achatVenteAxios.get<CaseTvaDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetDevises`);
    return new CaseTva(response.data);
  }

  static async getTaux(devise: number, datePiece: DateTime): Promise<number> {
    let response = await this.achatVenteAxios.get<number>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetTaux?devise=${devise}&datePiece=${datePiece.toUtc()}`);
    return response.data;
  }

  static async getAllStatut(): Promise<Statut[]> {
    let response = await this.achatVenteAxios.get<Statut[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetStatuts`);
    return response.data;
  }

  static async getAllDevises(): Promise<Devise[]> {
    let response = await this.achatVenteAxios.get<Devise[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetDevises`);
    return response.data;
  }

  static async getCompteTva(numeroJournal: number | string, codeTaxe: string | number, codePays?: string): Promise<CompteGenerealSearch> {
    let response = await this.achatVenteAxios.get<CompteGenerealSearch>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetCompteTVA?numeroJournal=${numeroJournal}&codePays=${codePays}&codeTaxeCompteTiers=${codeTaxe}`);
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
}
