import Vue from 'vue';
import Vuex from 'vuex';
import { IUserState } from './modules/user';
import { IApplicationState } from './modules/application';
import { ISocieteState } from './modules/companies';
Vue.use(Vuex);

export interface IRootState {
  application: IApplicationState;
  login: IUserState;
  societe: ISocieteState;
}

export default new Vuex.Store<IRootState>({});
