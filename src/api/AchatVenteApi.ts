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
  EntetePieceComptable
} from "@/models/AchatVente";

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
    date: Date
  ): Promise<Date> {
    let response = await this.achatVenteAxios.get(
      `${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetDateEcheance?typeCompte=${typeCompte}F&numeroCompte=${numeroCompte}&datePiece=${moment(date).format("DD/MM/YYYY")}`
    );
    return moment(response.data).toDate();;
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
}
