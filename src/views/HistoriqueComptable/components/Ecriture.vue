<template>
  <v-dialog v-model="visible">
    <v-toolbar color="primary" dark flat>
      <span>Période : (?)</span>
      <span class="pl-5">Pièce : {{ `${ecriture.codeJournal}.${ecriture.codePiece}` }}</span>
      <v-spacer />
      <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <v-data-table :items="ecriture.imputations" :headers="headers" :item-class="highlightRow" disable-sort>
          <template v-slot:[`item.pieceDesc`]="{ item }">
            <span class="text-end">{{
              ecriture.imputations.indexOf(item) > 0 ? item.pieceDesc : item.pieceDescEntete
            }}</span>
          </template>
          <template v-slot:[`header.creditDebit`]="">
            <v-row dense>
              <v-col cols="4" class="text-end">Débit</v-col>
              <v-col cols="4" class="text-end">Crédit</v-col>
            </v-row>
          </template>
          <template v-slot:[`item.creditDebit`]="{ item }">
            <v-row>
              <v-col cols="4" class="text-end">{{ item.codeMouvement == 'DB' ? item.mouvement : '' }}</v-col>
              <v-col cols="4" class="text-end">{{ item.codeMouvement == 'CR' ? item.mouvement : '' }}</v-col>
              <v-col cols="3" class="text-end">{{ item.libelleDevise }}</v-col>
            </v-row>
          </template>
        </v-data-table>
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
    { text: 'Date', value: 'dateDisplay' },
    { text: 'Pièce', value: 'pieceDesc', align: 'end' },
    { text: 'Compte', value: 'numeroCompte' },
    { text: 'Nom', value: 'nomCompte' },
    { text: 'Libellé', value: 'libellePiece' },
    { text: 'Débit  Crédit  Dev', value: 'creditDebit' },
    { text: 'TVA', value: 'case' },
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
    return item.codeLigneExtrait == this.highlightExtrait && item.codeLigneVentilation == this.highlightVentilation
      ? 'highlighted'
      : '';
  }

  private closeDialog() {
    this.ecriture = new DetailEcriture();
    this.visible = false;
  }
}
</script>

<style>
.highlighted {
  background-color: lightgrey;
}
</style>