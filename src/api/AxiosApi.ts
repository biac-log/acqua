import axios, { AxiosInstance } from 'axios';
import { UserModule } from '@/store/modules/user';
import { SocieteModule } from '@/store/modules/companies';

export default class AxiosApi {
  static get axiosBase() {
    return axios.create({
      headers: { Authorization: `Bearer ${UserModule.token}`, }
    });
  }

  private static _acQuaCore: AxiosInstance | null;
  static get AcQuaCore() {
    if (!this._acQuaCore ) {
      this._acQuaCore = axios.create({
        baseURL: process.env.VUE_APP_ApiAcQuaCore,
        headers: { Authorization: `Bearer ${UserModule.token}`, 'Company-Name': SocieteModule.companyIdentifiant }
      });
    }
    return this._acQuaCore;
  }

  public static refreshAcQuaCore() {
    this._acQuaCore = axios.create({
      baseURL: process.env.VUE_APP_ApiAcQuaCore,
      headers: { Authorization: `Bearer ${UserModule.token}`, 'Company-Name': SocieteModule.companyIdentifiant }
    });
  }

  private static _gestionUser: AxiosInstance | null;
  static get GestionUser() {
    if (!this._gestionUser) {
      this._gestionUser = axios.create({
        baseURL: process.env.VUE_APP_ApiGestionUser,
        headers: { Authorization: `Bearer ${UserModule.token}` }
      });
    }
    return this._gestionUser;
  }

  private static _aqua: AxiosInstance | null;
  static get AcQua() {
    if (!this._aqua) {
      this._aqua = axios.create({
        baseURL: process.env.VUE_APP_ApiAcQua,
        headers: { Authorization: `Bearer ${UserModule.token}` }
      });
    }
    return this._aqua;
  }

  private static _authentication: AxiosInstance | null;
  static get Authentication() {
    if (!this._authentication) {
      this._authentication = axios.create({
        baseURL: process.env.VUE_APP_ApiAuth
      });
    }
    return this._authentication;
  }

  private static _logging: AxiosInstance | null;
  static get Logging() {
    if (!this._logging) {
      this._logging = axios.create({
        baseURL: process.env.VUE_APP_ApiLogging
      });
    }
    return this._logging;
  }

  static reset() {
    this._acQuaCore = null;
    this._gestionUser = null;
    this._aqua = null;
    this._authentication = null;
    this._logging = null;
  }
}
