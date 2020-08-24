import { JournalDTO, Journal } from '@/models/AchatVente/Get/Journal';
import api from './AxiosApi';

export abstract class JournalApi {
  static async getAll(): Promise<Journal[]> {
    const response = await api.AcQuaCore.get<JournalDTO[]>(`/AchatVente/GetJournaux`);
    return response.data.map((journalDTO) => new Journal(journalDTO));
  }
}
