<template>
  <v-container fluid @keydown.107.prevent="addDevise()">
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
          id="indexSearch"
          outlined
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="devises"
        :search="search"
        :loading="isLoadingDevises"
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
import { Component, Vue, Ref } from 'vue-property-decorator';
import DeviseVue from '@/views/Maintenance/Devises/Devise.vue';

@Component({
  name: 'DevisesVue',
  components: { DeviseVue }
})
export default class DevisesVue extends Vue {
  @Ref() readonly deviseDialog!: DeviseVue;

  private unsubscribe!: Function;

  mounted() {
    this.loadDevises();
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
    this.devises = [];
    this.loadDevises();
  }

  private isLoadingDevises = false;

  private search = '';
  private isLoading = false;
  private devises: DeviseMaintenance[] = [];
  private headers = [
    { text: 'Id', value: 'id' },
    { text: 'Libellé', value: 'libelle' },
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
}
</script>

<style></style>
