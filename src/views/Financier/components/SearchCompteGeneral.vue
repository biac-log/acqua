<template>
  <v-dialog width="800" v-model="dialog" @click:outside="close()" @keydown.esc="close()" @keydown.page-up="nextPage()" @keydown.page-down="previousPage()">
    <v-card class="mt-5">
      <v-card-title>
        Comptes {{ typeLoad ? typeLoad.libelle : "" }}
        <v-btn color="primary" fab small class="ml-5" @click="refreshComptes">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreCompte"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          @keydown.down="giveFocusToRow(0)"
          autocomplete="off"
        ></v-text-field>
      </v-card-title>
      <AgGridVue 
        style="height: 561px;"
        id="dataTable"
        class="ag-theme-alpine"
        :columnDefs="headersComptes"
        :rowData="comptes"
        rowSelection="single"
        :gridOptions="gridOptions">
      </AgGridVue>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import {TypeCompte} from "@/models/AchatVente";
import CompteGeneralSearch from "@/models/Compte/CompteGeneralSearch";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import { CompteApi } from "@/api/CompteApi";
import axios from "axios";
import { ICellRenderer, GridOptions, GridApi } from 'ag-grid-community';
import { AgGridVue } from "ag-grid-vue";

@Component({
  name: "SearchCompteGeneral",
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog: boolean = false;
  private typeLoad: TypeCompte = new TypeCompte();
  private filtreCompte: string = "";
  private isLoading: boolean = false;
  private comptes: CompteGeneralSearch[] = [];
  private displayComptes: CompteGeneralSearch[] = [];
  private headersComptes = [
    { headerName: "Numéro", field: "numero", filter:true, width: 120 },
    { headerName: "Nom", field: "nom", filter:true, flex:1 },
    { headerName: "Solde", field: "libelleSolde", filter:true, cellStyle: { textAlign: "right" }, width: 100 },
    { headerName: "Nature", field: "libelleNature", filter:true, width: 120 },
    { headerName: "Case TVA", field: "caseTvaDisplay", filter:true, width: 120 }
  ];

  private resolve!: any;
  private reject!: any;

  private loadingCellRenderer: string | undefined | (new () => ICellRenderer) = undefined;
  private loadingCellRendererParams = null;
  private gridOptions: GridOptions = {
    columnDefs: this.headersComptes,
    rowSelection: "single",
    rowData: this.comptes,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Chargement des comptes</span>',
    pagination: true,
    paginationAutoPageSize:true,
    onRowDoubleClicked: this.rowDoubleClick
  };

  public open(typeToLoad: TypeCompte): Promise<CompteGeneralSearch> {
    this.dialog = true;
    this.loadComptes(typeToLoad);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setFilteredItems(e : CompteGeneralSearch[]){
    this.displayComptes = e;
  }

  private loadComptes(typeToLoad: TypeCompte) {
    if (this.typeLoad.id != typeToLoad.id) {
      this.typeLoad = typeToLoad;
      this.refreshComptes();
    }
  }

  private refreshComptes() {
    if (this.typeLoad.id) {
      this.isLoading = true;
      CompteApi.getComptesGeneraux(this.typeLoad.id)
        .then(resp => {
          this.comptes = resp;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private giveFocusToRow(id: number) {
    let ds = 0;
    this.gridOptions?.api?.forEachNode(function(node) {
      if (node.rowIndex === id) {
        node.setSelected(true);
        ds = node.rowIndex;
      }
    });
    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, "numero"));
  }

  @Watch("filtreCompte")
  private filterGrid(){
    this.gridOptions?.api?.setQuickFilter(this.filtreCompte);
  }

  private navigateToNextCell(params: any) {
    let previousCell = params.previousCellPosition;
    const suggestedNextCell = params.nextCellPosition;

    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;

    switch (params.key) {
      case KEY_DOWN:
        previousCell = params.previousCellPosition;
        // set selected cell on current cell + 1
        this.gridOptions?.api?.forEachNode(function(node) {
          if (previousCell.rowIndex + 1 === node.rowIndex) {
            node.setSelected(true);
          }
        });
        return suggestedNextCell;
      case KEY_UP:
        previousCell = params.previousCellPosition;
        // set selected cell on current cell - 1
        this.gridOptions?.api?.forEachNode(function(node) {
          if (previousCell.rowIndex - 1 === node.rowIndex) {
            node.setSelected(true);
          }
        });
        return suggestedNextCell;
      case KEY_LEFT:
      case KEY_RIGHT:
        return suggestedNextCell;
      default:
        console.log(
          "this will never happen, navigation is always one of the 4 keys above"
        );
    }
  }

  private keypress(event: any) {
    if(event?.event.key === "Enter"){
      var selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CompteGeneralSearch;
      this.sendCompte(selectedRow)
    }
  } 

  private rowDoubleClick(vlaue : any){
    var selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CompteGeneralSearch;
    this.reinitGrid();
    this.sendCompte(selectedRow)
  }
  
  private nextPage(){
    this?.gridOptions?.api?.paginationGoToNextPage();
  }

  private previousPage(){
    this?.gridOptions?.api?.paginationGoToPreviousPage();
  }

  private reinitGrid(){
    (this.gridOptions.api as GridApi).resetQuickFilter();
    (this.gridOptions.api as GridApi).deselectAll();
    (this.gridOptions.api as GridApi).setFilterModel(null);
    (this.gridOptions.api as GridApi).paginationGoToPage(0);
  }

  private sendCompte(compte: CompteGeneralSearch) {
    this.filtreCompte = "";
    this.dialog = false;
    this.reinitGrid();
    this.resolve(compte);
  }

  private close(){
    this.filtreCompte = "";
    this.dialog = false;
    this.reinitGrid();
    this.reject();
  }
}
</script>

<style>
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}
</style>
