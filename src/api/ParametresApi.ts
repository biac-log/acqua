import AxiosApi from './AxiosApi';
import { Parametre } from '@/models/Parametre';
import { ParametreFinancier } from '@/models/ParametreFinancier';

export default abstract class ParametreApi {
  static async get(): Promise<Parametre> {
    const resp = await AxiosApi.AcQuaCore.get<Parametre>('/Parametre/GetParametresGeneraux/');
    return resp.data;
  }

  static async getParamsFinanciers(): Promise<ParametreFinancier[]> {
    const resp = await AxiosApi.AcQuaCore.get<ParametreFinancier[]>('/ParamsFinanciers');
    return resp.data;
  }
}
