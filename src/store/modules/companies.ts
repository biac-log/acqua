import {VuexModule, Module, Mutation, Action, getModule} from 'vuex-module-decorators';
import store from '@/store'
import {Societe } from '@/models/Societe/societe'
import SocietesApi from '@/api/SocietesApi'
import AxiosApi from '@/api/AxiosApi';

export interface ISocieteState {
    societes: Societe[];
    societeSelected: Societe;
}

@Module({dynamic: true, store, name: 'companies'})
class SocieteMod extends VuexModule implements ISocieteState {
    public societeSelected = new Societe();
    public societes: Societe[] = [];

    @Mutation
    private setSocietes(societes: Societe[]){
        this.societes = Array.from(societes);
        this.societeSelected = societes[0];
    }

    @Action({rawError: true})
    async fetchSocietes(){
        const resp = await SocietesApi.getSocietes();
        this.setSocietes(this.societes);

        AxiosApi.refreshAcQuaCore();
    }

    @Action
    public refreshSocieteSelected(societe: Societe) {
        this.selectSociete(societe);
        AxiosApi.refreshAcQuaCore();
    }


    @Mutation
    public selectSociete(societe: Societe) {
        this.societeSelected = societe;
    }

    get databaseName() {
        return this.societeSelected?.databaseName || '';
    }

    get apolloPath() {
        return this.societeSelected?.apolloPath || '';
    }
}

export const SocieteModule = getModule(SocieteMod);