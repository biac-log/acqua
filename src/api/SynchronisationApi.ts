import api from './AxiosApi';

export default abstract class SynchronisationApi {
  static async SyncAll(): Promise<boolean> {
    const response = await api.AcQuaCore.get<boolean>(`/Synchronisation/SynchronisationSociete`);
    return response.data;
  }
}
