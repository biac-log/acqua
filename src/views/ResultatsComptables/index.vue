<template>
  <v-container fluid>
    <v-card class="pb-5">
      <v-form ref="form">
        <v-row align="start" justify="start" class="pl-5 pr-5">
          <v-select
            class="mt-3 ml-2"
            style="max-width: 182px"
            id="indexSearch"
            ref="typesStructure"
            autofocus
            label="Structure"
            outlined
            required
            hide-details
            :items="structures"
            v-model="structure"
          />
          <div style="max-width: 150px" class="mt-3 ml-5">
            <date-picker
              outlined
              label="A partir de"
              :date.sync="fromDateP1"
              ref="fromDateP1Field"
              hide-details
            />
          </div>
          <div class="mt-3 ml-2" style="max-width: 150px">
            <date-picker
              style="max-width: 150px"
              class="pt-3"
              outlined
              label="Jusqu'à"
              :date.sync="toDateP1"
              hide-details
              ref="toDateP1Field"
            />
          </div>
          <v-btn
            id="secondPeriodEnabler"
            class="align-self-center ml-3"
            elevation="2"
            icon
            v-on:click="secondPeriod = !secondPeriod"
          >
            <v-icon>
              {{secondPeriod? "mdi-minus" : "mdi-plus"}}
            </v-icon>
          </v-btn>
          <div v-show="secondPeriod" style="max-width: 150px" class="mt-3 ml-5">
            <date-picker
              outlined
              label="A partir de"
              :date.sync="fromDateP2"
              ref="fromDateP2Field"
              hide-details
            />
          </div>
          <div v-show="secondPeriod" class="mt-3 ml-2" style="max-width: 150px">
            <date-picker
              style="max-width: 150px"
              class="pt-3"
              outlined
              label="Jusqu'à"
              :date.sync="toDateP2"
              hide-details
              ref="toDateP2Field"
            />
          </div>
          <v-checkbox
            class="align-self-center pt-2 ml-3"
            v-model="compteResultat"
            :label="'Compte de résultat'"
          >
          </v-checkbox>
          <v-checkbox
            class="align-self-center pt-2 ml-3"
            v-model="bilan"
            :label="'Bilan'"
          >
          </v-checkbox>
          <v-spacer />
          <v-btn
            id="dataFetcher"
            elevation="2"
            class="align-self-center mr-3"
            v-on:click="onClickDataFetcher"
            :disabled="!enabledDataFetcherBtn()"
          >
            Chargerment
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">{{ snackbarColor == 'error' ? 'mdi-delete' : 'mdi-check' }}</v-icon>
      <span v-html="snackbarMessage"></span>
      <template v-slot:action="{ attrs }">
        <v-btn icon dark @click="snackbar = false" v-bind="attrs"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import DatePicker from '@/components/DatePicker.vue';
import { DateTime } from '@/models/DateTime';
import { PeriodeComptable } from '@/models/OperationDiverse/PeriodeComptable'
import OperationDiverseApi from '@/api/OperationDiverseApi';
import { ResultatsComptablesApi } from '@/api/ResultatsComptablesApi'
import { ResultatsComptables, ResultatsComptablesDTO } from '@/models/ResultatComptable/ResultatComptable'
import { PeriodeComptableDTO } from '@/models/Financier';

@Component({
  name: 'ResultatsComptables',
  components: { DatePicker }
})
export default class extends Vue {

  @Ref() private fromDateP1Field! : DatePicker;
  @Ref() private toDateP1Field! : DatePicker;
  @Ref() private fromDateP2Field! : DatePicker;
  @Ref() private toDateP2Field! : DatePicker;
  @Ref() private typesStructure! : any;

  private structures : string[] = [];
  private structure = "";

  // private periodeComptable : PeriodeComptable;
  private fromDateP1 = new DateTime();
  private toDateP1 = new DateTime();
  private fromDateP2 = new DateTime();
  private toDateP2 = new DateTime();
  private secondPeriod = false;

  private periodes: PeriodeComptable[] = [];

  //Flags
  private bilan = false;
  private canSwitchData = false;
  private compteResultat = false;
  private displayBilan = false;
  private periodeIsLoading = false;

  //Snackbar for error handlings
  private snackbar = false;
  private snackbarTimeout = 5000;
  private snackbarMessage = '';
  private snackbarColor = '';

  mounted(){
    this.loadPeriodes();
    this.loadStructures();
  }

  private initializePeriodes(){
    const currentPeriod = this.periodes.filter( x => x.typePeriodeComptable == "courante");
    if(currentPeriod && currentPeriod.length > 0 )
    {
      this.fromDateP1 = currentPeriod[0].dateDebut;
      (this.$refs.fromDateP1Field as DatePicker).dateSelected = this.fromDateP1.toString();
      this.toDateP1 = currentPeriod[0].dateFin;
      (this.$refs.toDateP1Field as DatePicker).dateSelected = this.toDateP1.toString();
    }
    const previousPeriod = this.periodes.filter( x => x.typePeriodeComptable == "precedente");
    if(previousPeriod && previousPeriod.length > 0 )
    {
      this.fromDateP2 = previousPeriod[0].dateDebut;
      Vue.nextTick( () =>
        (this.$refs.fromDateP2Field as DatePicker).dateSelected = this.fromDateP2.toString()
      );
      this.toDateP2 = previousPeriod[0].dateFin;
      Vue.nextTick(() =>
        (this.$refs.toDateP2Field as DatePicker).dateSelected = this.toDateP2.toString()
      );
    }
  }

  private async loadPeriodes(){
    try {
      this.periodeIsLoading = true;
      const periodes = await OperationDiverseApi.getPeriodes();
      periodes.forEach((p) => this.periodes.push(p));
      this.initializePeriodes();
    } catch (err) {
      this.notifier('Erreur lors du chargement des périodes', 'red');
    } finally {
      this.periodeIsLoading = false;
    }
  }

  private async loadStructures(){
    try{
      await ResultatsComptablesApi.getStructureFolderNames().then( x => {
        this.structures = x
        });
    } catch(err){
      this.notifier('Erreur lors du chargement des structures d\'affichage','red');
    }
  }

  private async loadResultatsComptablesData(resultatComptableDTO : ResultatsComptablesDTO){
    try{
      await ResultatsComptablesApi.getResultatsComptablesData(resultatComptableDTO).then( x => console.log(x));
    }catch(err){
      this.notifier('Erreur lors du chargement des données comptables','red');
    }
  }

  private isFirstPeriodValid(){
    if(!(this.$refs.fromDateP1Field as DatePicker).isDateValid)
      return false;
    if(!(this.$refs.toDateP1Field as DatePicker).isDateValid)
      return false;
    if(!this.fromDateP1.isBefore(this.toDateP1))
      return false;
    return true;
  }
  private isSecondPeriodValid(){
    if(!this.secondPeriod)
      return false;
    if(!(this.$refs.fromDateP2Field as DatePicker).isDateValid)
      return false;
    if(!(this.$refs.toDateP2Field as DatePicker).isDateValid)
      return false;
    if(!this.fromDateP2.isBefore(this.toDateP2))
      return false;
    return true;
  }

  private enabledDataFetcherBtn() : boolean{
    return this.structure != ''
          && (this.bilan || this.compteResultat)
          && this.isFirstPeriodValid()
          && (!this.secondPeriod || this.isSecondPeriodValid());
  }

  private onClickDataFetcher(){
    this.canSwitchData = this.bilan && this.compteResultat;
    this.displayBilan = this.bilan;
    const resultatsComptablesDTO : ResultatsComptablesDTO = new ResultatsComptablesDTO();
    resultatsComptablesDTO.structureName = this.structure;
    resultatsComptablesDTO.periode1 = new PeriodeComptableDTO();
    resultatsComptablesDTO.periode1.debut = this.fromDateP1.toUtc(); 
    resultatsComptablesDTO.periode1.fin = this.toDateP1.toUtc(); 
    resultatsComptablesDTO.compteBilan = this.bilan;
    resultatsComptablesDTO.compteResultat = this.compteResultat;

    if(this.secondPeriod){
      resultatsComptablesDTO.periode2.debut = this.fromDateP2.toUtc(); 
      resultatsComptablesDTO.periode2.fin = this.toDateP2.toUtc(); 
    }
    /*
    TODO refactor this
    this is a fix that shouldn't exist.
    I can't pass an empty string to the back end because he can't convert that to a datetime
    BUT
    It shouldn't. Maybe check if I can specifically tell to my back end that this value can be null
    Also, check how to make it null in the front end...
    */
    else{
      resultatsComptablesDTO.periode2 = resultatsComptablesDTO.periode1;
    }
    console.log(resultatsComptablesDTO);
    this.loadResultatsComptablesData(resultatsComptablesDTO);
  }

  private notifier(message: string, color: string) {
    this.snackbarColor = color;
    this.snackbarMessage = message;
    this.snackbar = true;
  }
}
</script>

<style scopped type="scss">

</style>
