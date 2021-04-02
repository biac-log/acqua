import { VuexModule, Module, Mutation, Action, getModule, MutationAction } from 'vuex-module-decorators';
import store from '@/store';
import { HistoriqueComptable } from '@/models/HistoriqueComptable/HistoriqueComptable';
import HistoriqueComptableApi from '@/api/HistoriqueComptableApi';
import { HistoriqueInput } from '@/models/HistoriqueComptable/HistoriqueInput';

export interface IHistoriqueState {
  historique: HistoriqueComptable;
}

@Module({ dynamic: true, store, name: 'historique' })
class HistoriqueMod extends VuexModule implements IHistoriqueState {
  public historique = new HistoriqueComptable();

  /** Mutations  **/

  @Mutation
  setHistorique(historique: HistoriqueComptable) {
    this.historique = historique;
  }

  @Mutation
  resetHistorique() {
    this.historique = new HistoriqueComptable();
  }

  /** Actions */
  @MutationAction
  async fetchHistorique(input: HistoriqueInput) {
    this.resetHistorique();
    const historique = await HistoriqueComptableApi.getHistorique(input);

    return { historique };
  }

  // /** Getters */
}

export const HistoriqueModule = getModule(HistoriqueMod);
