<template>
  <v-container fluid @keydown.107.prevent="addTaux()">
    <v-card>
      <v-card-title>
        Taux de conversion
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addTaux">
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

      <v-data-table :headers="headers" :items="taux" :search="search" :loading="isLoadingTaux" @click:row="openTaux">
        <template v-slot:[`item.date`]="{ item }">
          <span>{{ item.date | dateToString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <taux-vue ref="tauxDialog" />
  </v-container>
</template>

<script lang="ts">
import TauxApi from '@/api/TauxApi';
import { Taux } from '@/models/Taux/Taux';
import { Component, Vue, Ref } from 'vue-property-decorator';
import TauxVue from '@/views/Maintenance/Taux/Taux.vue';

@Component({
  name: 'TauxIndexVue',
  components: { TauxVue }
})
export default class TauxIndexVue extends Vue {
  @Ref() readonly tauxDialog!: TauxVue;

  mounted() {
    this.loadTaux();
  }

  private isLoadingTaux = false;

  private search = '';
  private isLoading = false;
  private taux: Taux[] = [];
  private headers = [
    { text: 'Base', value: 'base' },
    { text: 'Code', value: 'code' },
    { text: 'Date', value: 'date' },
    { text: 'Com', value: 'com' },
    { text: 'Tar', value: 'tar' }
  ];

  private async loadTaux() {
    this.isLoadingTaux = true;

    const tauxResult = await TauxApi.getAllTaux();
    this.taux = tauxResult;

    this.isLoadingTaux = false;
  }

  private addTaux() {
    this.tauxDialog
      .openNew()
      .then(() => {
        this.loadTaux();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }

  private openTaux(taux: Taux) {
    this.tauxDialog
      .open(taux)
      .then((reloadOnClose: boolean) => {
        if (reloadOnClose) this.loadTaux();
      })
      .catch(() => console.log('caught'))
      .finally(() => {
        this.$nextTick(() => (this.$refs.searchFocus as any).focus());
      });
  }
}
</script>

<style></style>
