<template>
  <div>
    <v-card class="mb-5">
      <v-row align="start" justify="start" class="pl-5 pr-5">
        <v-col cols="12" xs="12" md="4" lg="2">
          <v-select
            autofocus
            label="Type de fournisseur"
            outlined
            persistent-hint
            required
            :items="fournisseurTypes"            
          ></v-select>
        </v-col>
      </v-row>
    </v-card>
    <v-card>
      <v-card-title>
        Fournisseurs
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

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

  private fournisseurTypes = ["F","J","D"];

  mounted() {
    this.loadFournisseurs();
  }

  @Watch('options')
  onOptionsChanged() {
    this.loadFournisseurs();
  }

  @Watch('search')
  onSearchChanged() {
    this.loadFournisseurs();
  }

  private async loadFournisseurs() {
    const { sortBy, sortDesc, page, itemsPerPage } = this.options;
    const pagination = new Pagination();
    pagination.terms = this.search;
    pagination.sortBy = sortBy[0];
    pagination.sortDesc = sortDesc[0];
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
