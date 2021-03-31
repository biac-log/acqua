<template>
  <v-dialog v-model="visible" @keydown.34.prevent="pgDown" @keydown.33.prevent="pgUp" @click:outside="closeDialog">
    <v-toolbar color="primary" dark flat>
      <span>Période : {{ ecriture.periode }}</span>
      <span class="pl-5">Pièce : {{ `${ecriture.codeJournal}.${ecriture.codePiece}` }}</span>
      <span class="pl-5">{{ ecriture.periodeDesc }}</span>
      <v-spacer />
      <v-btn @click="jumpToHighlight" color="warning"> Afficher l'imputation </v-btn>
      <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4" />
      <v-card-text>
        <v-data-table
          :items="ecriture.imputations"
          :headers="headers"
          :item-class="highlightRow"
          disable-sort
          class="elevation-1"
          dense
          :items-per-page.sync="itemsPerPage"
          :page.sync="page"
        >
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
            <v-row dense>
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

  private page = 1;
  private itemsPerPage = 20;
  private isLoading = false;

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

  public async open(journal: number, piece: number, codeExtrait: number, codeVentilation: number) {
    this.visible = true;
    this.highlightExtrait = codeExtrait;
    this.highlightVentilation = codeVentilation;
    await this.loadEcriture(journal, piece);
  }

  private async loadEcriture(journal: number, piece: number) {
    this.isLoading = true;
    await HistoriqueComptableApi.getDetailEcriture(journal, piece)
      .then((resp) => (this.ecriture = resp))
      .finally(() => (this.isLoading = false));
  }

  // Ajout d'une surbrillance pour mettre en avant l'imputation sélectionnée à l'écran précédent
  private highlightRow(item: ImputationDetail) {
    return item.codeLigneExtrait == this.highlightExtrait && item.codeLigneVentilation == this.highlightVentilation
      ? 'highlighted'
      : '';
  }

  private pgDown() {
    this.page++;
  }

  private pgUp() {
    this.page--;
  }

  private jumpToHighlight() {
    const highlight =
      this.ecriture.imputations.find(
        (i) => i.codeLigneExtrait == this.highlightExtrait && i.codeLigneVentilation == this.highlightVentilation
      ) ?? new ImputationDetail();
    const highlightIndex = this.ecriture.imputations.indexOf(highlight);
    const pageToJump = highlightIndex / this.itemsPerPage + 1;
    this.page = pageToJump;
  }

  private closeDialog() {
    this.ecriture = new DetailEcriture();
    this.page = 0;
    this.visible = false;
  }
}
</script>

<style>
.highlighted {
  background-color: lightgrey;
}
.max-height-95 {
  max-height: 95%;
}
</style>