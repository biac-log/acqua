<template>
  <v-container fluid @keydown.107.prevent="addItem()">
    <v-card>
      <v-card-title>
        Libellés règlement
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
        ></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="items" :search="search" :loading="isLoadingItems" @click:row="openItem">
        <!-- <template v-slot:[`item.date`]="{ item }">
          <span>{{ item.date | dateToString }}</span>
        </template> -->
      </v-data-table>
    </v-card>
    <libelle-reglement-vue ref="itemDialog" />
  </v-container>
</template>

<script lang="ts">
import LibelleReglementApi from '@/api/LibelleReglementApi';
import { LibelleReglement } from '@/models/LibelleReglement/LibelleReglement';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import LibelleReglementVue from '@/views/Maintenance/LibellesReglement/LibelleReglement.vue';

@Component({
  name: 'LibellesReglementVue',
  components: { LibelleReglementVue }
})
export default class LibellesReglementVue extends Vue {
  @Ref() readonly itemDialog!: LibelleReglementVue;

  mounted() {
    this.loadItems();
  }

  private isLoadingItems = false;

  private search = '';
  private isLoading = false;
  private items: LibelleReglement[] = [];
  private headers = [
    { text: 'numero', value: 'numero' },
    { text: 'libelle', value: 'libelle' },
  ];

  private async loadItems() {
    this.isLoadingItems = true;

    const itemsResult = await LibelleReglementApi.getAll();
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

  private openItem(item: LibelleReglement) {
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
