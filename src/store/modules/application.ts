import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';
import ParametreApi from '@/api/ParametresApi';
import { Parametre } from '@/models/Parametre';

export interface IApplicationState {
  parametre: Parametre;
}

@Module({ dynamic: true, store, name: 'application' })
class Application extends VuexModule implements IApplicationState {
  public parametre = new Parametre();
  public singleUserMode = process.env.VUE_APP_SINGLE_USER_MODE;

  @Mutation
  private setParametre(parametre: Parametre) {
    this.parametre = parametre;
  }

  @Action
  public async initParametre() {
    const parametre = await ParametreApi.get();
    this.setParametre(parametre);
  }
}

export const ApplicationModule = getModule(Application);
