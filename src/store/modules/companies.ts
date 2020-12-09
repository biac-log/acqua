import {VuexModule, Module, Mutation, Action, getModule} from 'vuex-module-decorators';
import store from '@/store'
import {Societe } from '@/models/Societe/societe'

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
    fetchSocietes(){
        return [
            new Societe(),
            new Societe(),
            new Societe(),
        ];
    }
}

export const SocieteModule = getModule(SocieteMod);