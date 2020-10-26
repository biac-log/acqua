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
        ></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="items" :search="search" :loading="isLoadingItems" @click:row="openItem">
        <!-- <template v-slot:[`item.date`]="{ item }">
          <span>{{ item.date | dateToString }}</span>
        </template> -->
      </v-data-table>
    </v-card>
    <!-- <libelle-reglement-vue ref="itemDialog" /> -->
  </v-container>
</template>

<script lang="ts">
import CaseTvaApi from '@/api/CaseTvaApi';
import { CaseTva } from '@/models/CaseTva/CaseTva';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
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
  private items: CaseTva[] = [];
  private headers = [
    { text: 'Libellé', value: 'libelleCase' },
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

  private openItem(item: CaseTva) {
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
