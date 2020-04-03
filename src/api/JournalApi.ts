import Axios from "axios";
import Journal, {JournalDTO} from "@/models/Journal";

export abstract class JournalApi {
  private static journalAxios = Axios.create();

  static async getAll(): Promise<Journal[]>{
    let response = await this.journalAxios.get<JournalDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetJournaux`);
    return response.data.map(journalDTO => new Journal(journalDTO));
  }
}