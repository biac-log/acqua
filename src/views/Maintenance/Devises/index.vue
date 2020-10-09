<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Devises
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addDevise">
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
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="devisesFiltered"
        :search="search"
        :loading="isLoadingDevises"
        :options.sync="options"
        :server-items-length="totalItems"
        @click:row="openDevise"
      >
        <template v-slot:[`item.typeDevise`]="{ item }">
          <span>{{ item.typeDevise | typeDeviseDisplay }}</span>
        </template>
        <template v-slot:[`item.cee`]="{ item }">
          <v-icon color="green">{{ item.cee ? 'mdi-check' : '' }}</v-icon>
        </template>
      </v-data-table>
    </v-card>
    <devise-vue ref="deviseDialog" />
  </v-container>
</template>

<script lang="ts">
import DeviseApi from '@/api/DeviseApi';
import { DeviseMaintenance } from '@/models/Devise/DeviseMaintenance';
import { Pagination } from '@/models/Pagination';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import DeviseVue from '@/views/Maintenance/Devises/Devise.vue';

@Component({
  name: 'DevisesVue',
  components: { DeviseVue }
})
export default class DevisesVue extends Vue {
  @Ref() readonly deviseDialog!: DeviseVue;

  mounted() {
    this.loadDevises();
  }

  @Watch('options')
  onOptionsChanged() {
    this.filterDevises();
  }

  @Watch('search')
  onSearchChanged() {
    this.filterDevises();
  }

  private isLoadingDevises = false;

  private search = '';
  private options: any = {};
  private totalItems = 0;
  private isLoading = false;
  private devises: DeviseMaintenance[] = [];
  private devisesFiltered: DeviseMaintenance[] = [];
  private headers = [
    { text: 'Id', value: 'id' },
    { text: 'Libelle', value: 'libelle' },
    { text: 'Type', value: 'typeDevise' },
    { text: 'CEE', value: 'cee' }
  ];

  private async loadDevises() {
    this.isLoadingDevises = true;

    const devisesResult = await DeviseApi.getAllDevisesPaged();
    this.devises = [];

    devisesResult.items
      .map((d) => new DeviseMaintenance(d))
      .forEach((element: DeviseMaintenance) => {
        this.devises.push(element);
      });

    this.filterDevises();

    this.totalItems = devisesResult.totalCount;

    this.isLoadingDevises = false;
  }

  private addDevise() {
    this.deviseDialog
      .openNew()
      .then(() => {
        this.loadDevises();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }

  private openDevise(devise: DeviseMaintenance) {
    this.deviseDialog
      .open(devise)
      .then((reloadOnClose: boolean) => {
        if (reloadOnClose) this.loadDevises();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }

  private filterDevises() {
    const { sortBy, sortDesc, page, itemsPerPage } = this.options;
    if (this.search != '') {
      this.devisesFiltered = this.devises.filter((d) => d.libelle.toLowerCase().includes(this.search.toLowerCase()));
    } else {
      this.devisesFiltered = this.devises;
    }

    const begin = page == 1 ? 0 : (page - 1) * itemsPerPage;
    const end = begin + itemsPerPage;

    this.devisesFiltered = this.devisesFiltered.slice(begin, end);
  }
}
</script>

<style>
</style>