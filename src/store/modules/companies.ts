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
    public societeSelected = this.storedSociete;
    public societes: Societe[] = [];

    /** Mutations  **/ 
    @Mutation
    private setSocietes(societes: Societe[]){
        this.societes = Array.from(societes);        
    }

    @Mutation
    public selectSociete(societe: Societe) {
        this.societeSelected = societe;

        localStorage.setItem('societeSelected', JSON.stringify(societe));
        AxiosApi.refreshAcQuaCore();
    }

    @Mutation
    private clearSocietes(){
        this.societes = [];
        this.societeSelected = new Societe();
    }

    /** Actions */
    @Action({rawError: true})
    async fetchSocietes(){
        const resp = await SocietesApi.getSocietes();
        this.setSocietes(resp);
        if(!this.societeSelected.name) this.selectSociete(resp[0]);
    }

    @Action
    reset() {
        localStorage.removeItem('societeSelected');
        this.clearSocietes();
    }
    
    /** Getters */
    get companyIdentifiant() {
        return this.societeSelected?.identifiant || '';
    }

    private get storedSociete() {
        const string = localStorage.getItem('societeSelected') || '';
        const societe = string ? new Societe(JSON.parse(string)) : new Societe();
        return societe;
    }
}

export const SocieteModule = getModule(SocieteMod);