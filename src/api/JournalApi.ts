import Axios from "axios";
import {JournalDTO, Journal} from "@/models/AchatVente/Get/Journal";
import { UserModule } from "@/store/modules/user";
import api from "./AxiosApi";

export abstract class JournalApi {
  static async getAll(): Promise<Journal[]>{
    let response = await api.AcQuaCore.get<JournalDTO[]>(`/AchatVente/GetJournaux`);
    return response.data.map(journalDTO => new Journal(journalDTO));
  }
}