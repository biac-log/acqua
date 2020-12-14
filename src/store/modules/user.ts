import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Token } from '@/models/Login/Token';
import store from '@/store/index';
import { Utilisateur } from '@/models/Login/Utilisateur';
import { UserLogin } from '@/models/Login/UserLogin';
import { JsonConvert } from 'json2typescript';
import jwtDecode from 'jwt-decode';
import api from '@/api/AxiosApi';
import {SocieteModule} from './companies'
import {ApplicationModule} from './application'

export interface IUserState {
  token: string;
  username: string;
  expire: string;
  status: string;
  utilisateur: Utilisateur;
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token: string = localStorage.getItem('user-token') || '';
  public expire: string = localStorage.getItem('token-expire') || '';
  public status = '';
  public utilisateur: Utilisateur = new Utilisateur();
  public username = '';

  @Mutation
  private setToken(resp: Token): void {
    const dateExpire: string = (resp.expires_in * 1000 + Date.now()).toString();
    localStorage.setItem('user-token', resp.value);
    localStorage.setItem('token-expire', dateExpire);
    this.token = resp.value;
    this.expire = dateExpire;
    this.status = 'success';
  }

  @Mutation
  private setUser(user: Utilisateur): void {
    this.utilisateur = user;
    this.username = user.NomPrenom;
  }

  @Mutation
  private loginFail(): void {
    this.status = 'error';
  }

  @Mutation
  private resetToken(): void {
    localStorage.removeItem('user-token');
    this.token = '';
    localStorage.removeItem('token-expire');
    this.expire = '';
  }

  @Action({ rawError: true })
  public login(userInfo: UserLogin): Promise<any> {
    userInfo.takePermissions = true;
    userInfo.application = 'ACQUA';
    return new Promise((resolve, reject) => {
      api.Authentication.post<Token>('/Authentication/LoginApp', userInfo)
        .then(async (resp) => {
          this.setToken(resp.data);
          const tokenDecode = jwtDecode(resp.data.value);
          const jsonConvert: JsonConvert = new JsonConvert();
          const user = jsonConvert.deserializeObject(tokenDecode, Utilisateur);
          await this.setUser(user);
          resolve(resp);
        })
        .catch((err) => {
          this.loginFail();
          let errorMessage = "Impossible de se connecter au serveur d'authentification";
          if (err.response && err.response.status === 400) {
            errorMessage = err.response.data.Message;
          }
          reject(errorMessage);
        });
    });
  }

  @Action
  public async loadUser() {
    // return new Promise((resolve, reject) => {
      try {
        const tokenDecode = jwtDecode(this.token);
        const jsonConvert: JsonConvert = new JsonConvert();
        const user = jsonConvert.deserializeObject(tokenDecode, Utilisateur);
        await this.setUser(user);
        // resolve();
      } catch (err) {
        this.resetToken();
        // reject();
      }
    // });
  }

  @Action
  public logout() {
    this.resetToken();
    api.reset();
  }
}

export const UserModule = getModule(User);
