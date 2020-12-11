import {VuexModule, Module, Mutation, Action, getModule} from 'vuex-module-decorators';
import store from '@/store'
import {Societe } from '@/models/Societe/societe'
import SocietesApi from '@/api/SocietesApi'

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

    @Action({commit: 'setSocietes'})
    async fetchSocietes(){
        const resp = await SocietesApi.getSocietes();

        return resp;
    }

    @Mutation
    public selectSociete(societe: Societe) {
        this.societeSelected = societe;
    }
}

export const SocieteModule = getModule(SocieteMod);