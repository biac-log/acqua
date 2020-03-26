<template>
	<v-container>
    <v-radio-group v-model="periode" row @change="LoadPeriode">
      <v-radio label="Période courante" value="Courante"></v-radio>
      <v-radio label="Période précédente" value="Precedente"></v-radio>
    </v-radio-group>
    {{debutPeriode}}
    {{finPeriode}}
    {{Title}}
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from 'axios';
import { PeriodeComptable } from '@/models/PeriodeComptable'

@Component({
  name: "AchatVente"
})
export default class extends Vue {
  public Title: string="";
  public periode: string = "";
  public debutPeriode : Date = new Date();
  public finPeriode : Date = new Date();

  public LoadPeriode(){
      this.Title = this.periode

     axios.get<PeriodeComptable>(process.env.VUE_APP_ApiAcQuaCore + "/AchatVente/GetPeriode" + this.periode)
          .then((resp) => {
              this.debutPeriode = resp.data.debut;
              this.finPeriode = resp.data.fin;
          });
  }
}
</script>
