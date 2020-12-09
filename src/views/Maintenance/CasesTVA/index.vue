<template>
  <v-container fluid @keydown.107.prevent="addItem()">
    <v-card>
      <v-card-title>
        Cases TVA
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addItem">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
          autofocus
          ref="searchFocus"
          id="indexSearch"
          outlined
        ></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="items" :search="search" :loading="isLoadingItems" @click:row="openItem">
        <template v-slot:[`item.typeCase`]="{ item }">
          {{ item.libelleType }}
        </template>
        <template v-slot:[`item.intrastat`]="{ item }">
          <v-icon color="green">{{ item.intrastat ? 'mdi-check' : '' }}</v-icon>
        </template>
        <template v-slot:[`item.tauxTvaCase`]="{ item }">
          {{ item.tauxTvaCase | numberToString }}
        </template>
        <template v-slot:[`item.tauxEgalisationCase`]="{ item }">
          {{ item.tauxEgalisationCase | numberToString }}
        </template>
        <!-- 
        <template v-slot:[`item.facturesAchat`]="{ item }">
          <v-icon color="green">{{ item.facturesAchat ? 'mdi-check' : '' }}</v-icon>
        </template>
        <template v-slot:[`item.ncSurAchat`]="{ item }">
          <v-icon color="green">{{ item.ncSurAchat ? 'mdi-check' : '' }}</v-icon>
        </template>
        <template v-slot:[`item.financiers`]="{ item }">
          <v-icon color="green">{{ item.financiers ? 'mdi-check' : '' }}</v-icon>
        </template>
        <template v-slot:[`item.od`]="{ item }">
          <v-icon color="green">{{ item.od ? 'mdi-check' : '' }}</v-icon>
        </template> -->
      </v-data-table>
    </v-card>
    <case-tva-vue ref="itemDialog" />
  </v-container>
</template>

<script lang="ts">
import CaseTvaApi from '@/api/CaseTvaApi';
import { CaseTvaMaintenance } from '@/models/CaseTva/CaseTvaMaintenance';
import { Component, Vue, Ref } from 'vue-property-decorator';
import CaseTvaVue from '@/views/Maintenance/CasesTVA/CaseTVA.vue';

@Component({
  name: 'CasesTvaVue',
  components: { CaseTvaVue }
})
export default class CasesTvaVue extends Vue {
  @Ref() readonly itemDialog!: CaseTvaVue;

  mounted() {
    this.loadItems();
  }

  private isLoadingItems = false;

  private search = '';
  private isLoading = false;
  private items: CaseTvaMaintenance[] = [];
  private headers = [
    { text: 'Numéro', value: 'numeroCase' },
    { text: 'Libellé', value: 'libelleCase' },
    { text: 'Type', value: 'typeCase' },
    { text: 'Taux TVA', value: 'tauxTvaCase' },
    { text: 'Taux Egalisé', value: 'tauxEgalisationCase' },
    // {text: 'NC Ventes', value: 'ncSurVente'},
    // {text: 'Factures Ventes', value: 'facturesVentes'},
    // {text: 'Factures Achat', value: 'facturesAchat'},
    // {text: 'NC Achat', value: 'ncSurAchat'},
    // {text: 'Financiers', value: 'financiers'},
    // {text: 'O.D', value: 'od'},
    { text: 'Code Pays', value: 'codePays' },
    { text: 'Intrastat', value: 'intrastat' }
  ];

  private async loadItems() {
    this.isLoadingItems = true;

    const itemsResult = await CaseTvaApi.getAll();
    this.items = itemsResult;

    this.isLoadingItems = false;
  }

  private addItem() {
    this.itemDialog
      .openNew()
      .then(() => {
        this.loadItems();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }

  private openItem(item: CaseTvaMaintenance) {
    this.itemDialog
      .open(item)
      .then((reloadOnClose: boolean) => {
        if (reloadOnClose) this.loadItems();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }
}
</script>

<style></style>
