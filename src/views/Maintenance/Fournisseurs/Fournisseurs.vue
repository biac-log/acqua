<template>
  <div>
    Fournisseurs
    <!-- <v-data-table
    :headers="Headers"
    :items="fournisseurs"
    :items-per-page="5"
    class="elevation-1"
  ></v-data-table>
  <AgGridVue 
      style="height: 561px;"
      id="dataTableFournisseurs"
      class="ag-theme-alpine"
      :columnDefs="HeadersFournisseurs"
      :rowData="fournisseurs"
      rowSelection="single"
      :gridOptions="gridOptions">
    </AgGridVue> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { FournisseurApi } from '@/api/FournisseurApi';
import { Pagination } from '@/models/Pagination';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';

@Component({
  name: 'Fournisseurs'
})
export default class extends Vue {
  private fournisseurs: SearchFournisseur[] = []

  mounted() {
    this.loadFournisseurs();
  }

  private async loadFournisseurs(){
    const pagination = new Pagination();
    pagination.page = 1;
    pagination.limit = 15;
    const fournisseursResult = await FournisseurApi.getSearchFournisseurs(pagination);
    fournisseursResult.items.forEach(element => {
      this.fournisseurs.push(element); // This raises an error, but actually it works .. 
    });
  }
}
</script>

<style scopped></style>
