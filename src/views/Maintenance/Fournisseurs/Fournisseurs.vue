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

@Component({
  name: 'Fournisseurs'
})
export default class extends Vue {}
</script>

<style scopped></style>
