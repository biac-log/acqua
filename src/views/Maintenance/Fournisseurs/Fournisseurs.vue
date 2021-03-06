<template>
  <v-container fluid @keydown.107.prevent="addFournisseur()">
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
          autofocus
          ref="searchFocus"
          id="indexSearch"
          outlined
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
      >
        <template v-slot:[`item.solde`]="{ item }">
          <span>{{ item.solde | numberToComptaString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <FournisseurVue ref="fournisseurDialog" />
  </v-container>
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
  @Ref() readonly searchFocus!: any;

  private unsubscribe!: Function;

  mounted() {
    this.loadFournisseurs();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if(mutation.type === 'selectSociete') {
        this.reset();
      }
    });
    
  }

  beforeDestroy() {
    this.unsubscribe();
  }

  private reset() {
    this.fournisseurs = [];
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

    fournisseursResult.items
      .map((f) => new SearchFournisseur(f))
      .forEach((element: SearchFournisseur) => {
        this.fournisseurs.push(element);
      });

    this.totalItems = fournisseursResult.totalCount;

    this.isLoadingFournisseurs = false;
  }

  private async openFournisseur(SearchFournisseur: SearchFournisseur) {
    this.fournisseurDialog
      .open(SearchFournisseur)
      .then((reloadOnClose: boolean) => {
        if (reloadOnClose) this.loadFournisseurs();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }

  private addFournisseur() {
    this.fournisseurDialog
      .openNew()
      .then(() => {
        this.loadFournisseurs();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }
}
</script>

<style scoped></style>
