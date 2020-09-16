<template>
  <div>
    <v-card>
      <v-card-title>
        Fournisseurs
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addFournisseur">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
        @click:row="openFournisseur"
      ></v-data-table>
    </v-card>
    <FournisseurVue ref="fournisseurDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch } from 'vue-property-decorator';
import { FournisseurApi } from '@/api/FournisseurApi';
import { Pagination } from '@/models/Pagination';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import FournisseurVue from './components/Fournisseur.vue';

@Component({
  name: 'Fournisseurs',
  components: { FournisseurVue }
})
export default class extends Vue {
  private search = '';
  private options: any = {};
  private totalItems = 0;
  private isLoadingFournisseurs = false;
  private fournisseurs: SearchFournisseur[] = [];
  private headers = [
    { text: 'Numéro', value: 'numero' },
    { text: 'Nom', value: 'nom' },
    { text: 'Match Code', value: 'matchCode' },
    { text: 'Solde', value: 'solde' },
    { text: 'Adresse', value: 'adresse' }
  ];

  @Ref() readonly fournisseurDialog!: FournisseurVue;

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

    fournisseursResult.items.forEach((element: SearchFournisseur) => {
      this.fournisseurs.push(element);
    });

    this.totalItems = fournisseursResult.totalCount;

    this.isLoadingFournisseurs = false;
  }

  private async openFournisseur(SearchFournisseur: SearchFournisseur) {
    this.fournisseurDialog.open(SearchFournisseur);
  }

  private addFournisseur() {
    this.fournisseurDialog.openNew(this.fournisseurs[0].numero + 1).then(() => this.loadFournisseurs()); //TODO : retrieve correct number
  }
}
</script>

<style scoped></style>
