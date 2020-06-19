import Axios from "axios";
import { UserModule } from "@/store/modules/user";
import { CaseTva, CaseTvaDTO } from '@/models/CaseTva/CaseTva';

export abstract class CaseTvaApi {
  private static axios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getCasesTVADisponibles(journal: number | string): Promise<CaseTva[]> {
    let response = await this.axios.get<
    CaseTva[]
    >(
      `${process.env.VUE_APP_ApiAcQuaCore}/CaseTVA/GetCasesTVADisponibles?numeroJournal=${journal}`
    );
    return response.data.map(
      caseTvaDTO => new CaseTva(caseTvaDTO)
    );
  }

  static async getCaseTVA(numeroCase: number | string, numeroJournal : number | string): Promise<CaseTva> {
    let response = await this.axios.get<CaseTvaDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/CaseTVA/GetCaseTVA?numeroCase=${numeroCase}&numeroJournal=${numeroJournal}`);
    return new CaseTva(response.data);
  }
}