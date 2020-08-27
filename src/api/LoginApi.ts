import { Token } from '@/models/Login/Token';
import { UserLogin } from '@/models/Login/UserLogin';
import AxiosApi from './AxiosApi';

export default abstract class LoginApi {
  static async login(userInfo: UserLogin): Promise<Token> {
    const resp = await AxiosApi.Authentication.post<Token>('/Authentication/LoginApp', userInfo);
    return resp.data;
  }
}
