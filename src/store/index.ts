import Vue from "vue";
import Vuex from "vuex";
import { IUserState } from "./modules/user"
Vue.use(Vuex);

export interface IRootState {
  login: IUserState;
}

export default new Vuex.Store<IRootState>({})
