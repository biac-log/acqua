import Axios from "axios";
import {JournalDTO, Journal, PeriodeComptable, PeriodeComptableDTO, EntetePieceComptable, EntetePieceComptableDTO} from "@/models/Financier";
import { UserModule } from "@/store/modules/user";

export abstract class FinancierApi {
  private static axios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getPeriodes(): Promise<PeriodeComptable[]>{
    let responseCourante = await this.axios.get<PeriodeComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Financier/GetPeriodeCourante`);
    let responsePrecedente = await this.axios.get<PeriodeComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/Financier/GetPeriodePrecedente`);
    let periodes: PeriodeComptable[] = [];
    periodes.push(new PeriodeComptable(responseCourante.data));
    periodes.push(new PeriodeComptable(responsePrecedente.data));
    return periodes;
  }

  static async getJournaux(): Promise<Journal[]>{
    let response = await this.axios.get<JournalDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Financier/GetJournaux`);
    return response.data.map(journal => new Journal(journal));
  }

  static async getEntetePiecesComptables(numeroJournal: number, periode: string): Promise<EntetePieceComptable[]>{
    let response = await this.axios.get<EntetePieceComptableDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Financier/GetEntetePiecesComptables?numeroJournal=${numeroJournal}&stPeriode=${periode}`);
    return response.data.map(entete => new EntetePieceComptable(entete));
  }
}