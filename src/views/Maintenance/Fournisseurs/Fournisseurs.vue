<template>
	<div>Bonjour
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
import { Component, Vue, Watch } from "vue-property-decorator";
import {FournisseurApi} from "../../../api/FournisseurApi"
import axios from "axios";
import { SearchFournisseur } from '../../../models/Fournisseur/SearchFournisseur';
import { AgGridVue } from "ag-grid-vue";

@Component({
  name: "Fournisseurs"
  })
export default class extends Vue {
  
  
}
   
</script>


<style scopped>

</style>