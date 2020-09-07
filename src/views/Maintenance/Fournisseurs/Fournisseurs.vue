<template>
  <div>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="fournisseurs"
        :search="search"
        :loading="isLoadingFournisseurs"
        :options.sync="options"
        :server-items-length="totalItems"
      ></v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { FournisseurApi } from '@/api/FournisseurApi';
import { Pagination } from '@/models/Pagination';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';

@Component({
  name: 'Fournisseurs'
})
export default class extends Vue {
  private search = '';
  private options: any = {};
  private totalItems = 0;
  private isLoadingFournisseurs = false;
  private fournisseurs: SearchFournisseur[] = [];
  private headers = [
    { text: 'Numéro', value: 'numero' },
    { text: 'Type', value: 'type' },
    { text: 'Nom', value: 'nom' },
    { text: 'Match Code', value: 'matchCode' },
    { text: 'Solde', value: 'solde' },
    { text: 'Adresse', value: 'adresse' }
  ];

  mounted() {
    this.loadFournisseurs();
    console.log('fournisseurs', this.fournisseurs.length);
  }

  @Watch('options')
  onOptionsChanged() {
    this.loadFournisseurs();
  }

  private async loadFournisseurs() {
    const { sortBy, sortDesc, page, itemsPerPage } = this.options;
    const pagination = new Pagination();
    pagination.terms = this.search;
    pagination.sortBy = sortBy;
    pagination.sortDesc = sortDesc;
    pagination.page = page;
    pagination.limit = itemsPerPage;

    this.isLoadingFournisseurs = true;
    const fournisseursResult = await FournisseurApi.getSearchFournisseurs(pagination);
    this.fournisseurs = [];
    fournisseursResult.items.forEach((element) => {
      this.fournisseurs.push(element); // This raises an error, but actually it works ..
    });
    this.totalItems = fournisseursResult.totalCount;

    this.isLoadingFournisseurs = false;
  }
}
</script>

<style scoped></style>
