import AxiosApi from './AxiosApi';
import { Parametre } from '@/models/Parametre';

export default abstract class ParametreApi {
  static async get(): Promise<Parametre> {
    const resp = await AxiosApi.AcQuaCore.get<Parametre>('/Parametre/GetParametresGeneraux/');
    return resp.data;
  }
}
