<template>
  <v-dialog v-model="visible"> </v-dialog>
</template>

<script lang="ts">
import HistoriqueComptableApi from '@/api/HistoriqueComptableApi';
import { DetailEcriture } from '@/models/HistoriqueComptable/DetailEcriture';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
@Component({
  name: 'Ecriture',
  components: {},
})
export default class Ecriture extends Vue {
  private visible = false;

  private ecriture = new DetailEcriture();

  public open(journal: number, piece: number) {
    this.visible = true;
    this.loadEcriture(journal, piece);
  }

  private loadEcriture(journal: number, piece: number) {
    HistoriqueComptableApi.getDetailEcriture(journal, piece).then((resp) => (this.ecriture = resp));
  }
}
</script>

<style>
</style>