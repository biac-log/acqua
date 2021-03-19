<template>
  <v-dialog v-model="visible">
    <v-toolbar color="primary" dark flat>
      <span>Période : (?)</span>
      <span class="pl-5">Pièce : {{ `${ecriture.codeJournal}.${ecriture.codePiece}` }}</span>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <v-data-table :items="ecriture.imputations" :headers="headers" :item-class="highlightRow"></v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import HistoriqueComptableApi from '@/api/HistoriqueComptableApi';
import { DetailEcriture } from '@/models/HistoriqueComptable/DetailEcriture';
import { ImputationDetail } from '@/models/HistoriqueComptable/ImputationDetail';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
@Component({
  name: 'Ecriture',
  components: {},
})
export default class Ecriture extends Vue {
  private visible = false;

  private ecriture = new DetailEcriture();

  private highlightExtrait!: number;
  private highlightVentilation!: number;

  private headers = [
    { text: 'Date', value: 'date' },
    { text: 'Pièce', value: 'pieceDesc' },
    { text: 'Compte', value: 'numeroCompte' },
    { text: 'Nom', value: 'nomCompte' },
    { text: 'Libellé', value: 'libellePiece' },
    { text: 'Débit  Crédit  Dev', value: 'mouvementBase' },
    { text: 'TVA', value: 'caseBase' },
    { text: 'Référence', value: 'reference' },
  ];

  public open(journal: number, piece: number, codeExtrait: number, codeVentilation: number) {
    this.visible = true;
    this.highlightExtrait = codeExtrait;
    this.highlightVentilation = codeVentilation;
    this.loadEcriture(journal, piece);
  }

  private loadEcriture(journal: number, piece: number) {
    HistoriqueComptableApi.getDetailEcriture(journal, piece).then((resp) => (this.ecriture = resp));
  }

  private highlightRow(item: ImputationDetail) {
    console.log(item.codeLigneExtrait == this.highlightExtrait && item.codeLigneVentilation == this.highlightVentilation);
    return item.codeLigneExtrait == this.highlightExtrait && item.codeLigneVentilation == this.highlightVentilation
      ? 'highlighted'
      : '';
  }
}
</script>

<style>
.highlighted {
  background-color: lightgrey;
}
</style>