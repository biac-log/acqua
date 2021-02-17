import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import store from '@/store';
import ParametreApi from '@/api/ParametresApi';
import { Parametre } from '@/models/Parametre';
import { ParametreFinancier } from '@/models/ParametreFinancier';

export interface IApplicationState {
  parametre: Parametre;
}

@Module({ dynamic: true, store, name: 'application' })
class Application extends VuexModule implements IApplicationState {
  public parametre = new Parametre();
  public singleUserMode = process.env.VUE_APP_SINGLE_USER_MODE;
  public parametresFinanciers: ParametreFinancier[] = [];

  @Mutation
  private setParametre(parametre: Parametre) {
    this.parametre = parametre;
  }

  @Mutation
  private setParametresFinanciers(params: ParametreFinancier[]) {
    this.parametresFinanciers = params;
  }

  @Action
  public async initParametre() {
    const parametre = await ParametreApi.get();
    this.setParametre(parametre);
  }

  @Action
  public async initParametresFinanciers() {
    const parametres = await ParametreApi.getParamsFinanciers();
    this.setParametresFinanciers(parametres);
  }

  get compteTvaClient() {
    // return this.getParamFinancierByKey('TvaClient');
    return this.parametresFinanciers.find((param) => param.key == 'TvaClient') || new ParametreFinancier();
  }

  get compteTvaFournisseur() {
    // return this.getParamFinancierByKey('TvaFournisseur');
    return this.parametresFinanciers.find((param) => param.key == 'TvaFournisseur') || new ParametreFinancier();
  }

  private getParamFinancierByKey(key: string){
    return this.parametresFinanciers.find((param) => param.key == key) || new ParametreFinancier();
  }
}

export const ApplicationModule = getModule(Application);
