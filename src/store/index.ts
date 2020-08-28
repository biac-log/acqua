import Vue from 'vue';
import Vuex from 'vuex';
import { IUserState } from './modules/user';
import { IApplicationState } from './modules/application';
Vue.use(Vuex);

export interface IRootState {
  application: IApplicationState;
  login: IUserState;
}

export default new Vuex.Store<IRootState>({});
