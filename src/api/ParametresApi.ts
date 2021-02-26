import AxiosApi from './AxiosApi';
import { Parametre } from '@/models/Parametre';
import { ParametreFinancier, ParametreFinancierDTO } from '@/models/ParametreFinancier';

export default abstract class ParametreApi {
  static async get(): Promise<Parametre> {
    const resp = await AxiosApi.AcQuaCore.get<Parametre>('/Parametre/GetParametresGeneraux/');
    return resp.data;
  }

  static async getParamsFinanciers(): Promise<ParametreFinancier[]> {
    const resp = await AxiosApi.AcQuaCore.get<ParametreFinancierDTO[]>('/ParamsFinanciers');
    return resp.data.map((dto) => new ParametreFinancier(dto));
  }
}
