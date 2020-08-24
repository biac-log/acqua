import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Token } from '@/models/Login/Token';
import store from '@/store/index';
import { Utilisateur } from '@/models/Login/Utilisateur';
import { UserLogin } from '@/models/Login/UserLogin';
import { JsonObject, JsonProperty, JsonConvert } from 'json2typescript';
import jwtDecode from 'jwt-decode';
import api from '@/api/AxiosApi';

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
  private SET_TOKEN(resp: Token): void {
    const dateExpire: string = (resp.expires_in * 1000 + Date.now()).toString();
    localStorage.setItem('user-token', resp.value);
    localStorage.setItem('token-expire', dateExpire);
    this.token = resp.value;
    this.expire = dateExpire;
    this.status = 'success';
  }

  @Mutation
  private SET_USER(user: Utilisateur): void {
    this.utilisateur = user;
    this.username = user.NomPrenom;
  }

  @Mutation
  private LOGIN_FAIL(): void {
    this.status = 'error';
  }

  @Mutation
  private RESET_TOKEN(): void {
    localStorage.removeItem('user-token');
    this.token = '';
    localStorage.removeItem('token-expire');
    this.expire = '';
  }

  @Action({ rawError: true })
  public Login(userInfo: UserLogin): Promise<any> {
    userInfo.takePermissions = true;
    userInfo.application = 'ACQUA';
    return new Promise((resolve, reject) => {
      api.Authentication.post<Token>('/Authentication/LoginApp', userInfo)
        .then((resp) => {
          this.SET_TOKEN(resp.data);
          const tokenDecode = jwtDecode(resp.data.value);
          const jsonConvert: JsonConvert = new JsonConvert();
          const user = jsonConvert.deserializeObject(tokenDecode, Utilisateur);
          this.SET_USER(user);
          resolve(resp);
        })
        .catch((err) => {
          this.LOGIN_FAIL();
          let errorMessage = "Impossible de se connecter au serveur d'authentification";
          if (err.response && err.response.status === 400) {
            errorMessage = err.response.data.Message;
          }
          reject(errorMessage);
        });
    });
  }

  @Action
  public LoadUser() {
    return new Promise((resolve, reject) => {
      try {
        const tokenDecode = jwtDecode(this.token);
        const jsonConvert: JsonConvert = new JsonConvert();
        const user = jsonConvert.deserializeObject(tokenDecode, Utilisateur);
        this.SET_USER(user);
        resolve();
      } catch (err) {
        this.RESET_TOKEN();
        reject();
      }
    });
  }

  @Action
  public Logout() {
    this.RESET_TOKEN();
    api.reset();
  }
}

export const UserModule = getModule(User);
