<template>
  <v-dialog width="800" 
            v-model="dialog" 
            @click:outside="close" 
            @keydown.esc="close()"
            @keydown.page-up="nextPage()" 
            @keydown.page-down="previousPage()"
            @keydown.ctrl.f.prevent="focusSearch()">
    <v-card :loading="isLoading">
      <v-card-title>
        Dossier
        <v-btn color="primary" fab class="ml-5" small @click="refreshDossiers">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreDossier"
          ref="filterField"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          @keydown.down.prevent="giveFocusToFirstDisplayRow()"
          autocomplete="off"
        ></v-text-field>
      </v-card-title>
      <AgGridVue 
        style="height: 561px;"
        id="dataTable"
        class="ag-theme-alpine"
        :columnDefs="headersDossier"
        :rowData="dossiers"
        rowSelection="single"
        :gridOptions="gridOptions">
      </AgGridVue>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AgGridVue } from "ag-grid-vue";
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import { DossierSearch } from "@/models/Dossier/DossierSearch";
import { DossierApi } from "@/api/DossierApi";
import axios from "axios";
import { GridOptions, ICellRenderer, GridApi, ValueFormatterParams } from 'ag-grid-community';
import { DateTime } from '@/models/DateTime';

@Component({
  name: "SearchCaseTva",
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog: boolean = false;
  private isLoading: boolean = false;
  private filtreDossier: string = "";
  private dossiers: DossierSearch[] = [];
  private headersDossier = [
    { headerName: "Id", field: "idDossier" , width: 100},
    { headerName: "Nom", field: "nom", flex: 1 },
    { headerName: "Date entrée", field: "dateEntreeDate", width: 140, type: 'dateColumn' },
    { headerName: "Date sortie", field: "dateSortieDate", width: 140, type: 'dateColumn' },
  ];

  private resolve!: any;
  private reject!: any;

  private gridOptions: GridOptions = {
    columnDefs: this.headersDossier,
    rowSelection: "single",
    rowData: this.dossiers,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    onRowDoubleClicked: this.rowDoubleClick,
    pagination: true,
    paginationAutoPageSize:true,
    defaultColDef: {
        sortable: true
    },
    columnTypes: {
      'dateColumn': {
        filter: 'agDateColumnFilter',
        suppressMenu: true
      }
    },
  };
  private gridApi?: GridApi | null;

  mounted(){
    this.gridApi = this.gridOptions.api;
  }

  public open(): Promise<DossierSearch> {
    this.dialog = true;
    if(this.dossiers.length === 0)
      this.refreshDossiers();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private refreshDossiers() {
    this.isLoading = true;
    DossierApi.getAll()
    .then(resp => {
      this.dossiers = resp;
    })
    .finally(() => {
      this.isLoading = false;
    });
  }

  @Watch("filtreDossier")
  private filterGrid(){
    this.gridOptions?.api?.setQuickFilter(this.filtreDossier);
  }

  private keypress(event: any) {
    if(event?.event.key === "Enter"){
      var selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as DossierSearch;
      this.sendDossier(selectedRow)
    }
  } 

  private rowDoubleClick(vlaue : any){
    var selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as DossierSearch;
    this.sendDossier(selectedRow)
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
        if(previousCell.rowIndex == 0)
          this.focusSearch();
        else{
          previousCell = params.previousCellPosition;
          // set selected cell on current cell - 1
          this.gridOptions?.api?.forEachNode(function(node) {
            if (previousCell.rowIndex - 1 === node.rowIndex) {
              node.setSelected(true);
            }
          });
          return suggestedNextCell;
        }
      case KEY_LEFT:
      case KEY_RIGHT:
        return suggestedNextCell;
      default:
        console.log(
          "this will never happen, navigation is always one of the 4 keys above"
        );
    }
  }

  private focusSearch(){
    (this.gridOptions.api as GridApi).deselectAll();
    this.$nextTick(() => (this.$refs.filterField as any).focus());
  }

  private giveFocusToFirstDisplayRow(){
    let rowToFocus = this?.gridOptions?.api?.getFirstDisplayedRow() || 0;
    this.giveFocusToRow(rowToFocus);
  }

  private giveFocusToRow(id: number) {
    if (id < (this?.gridOptions?.api?.getFirstDisplayedRow() || 0)) id = 0;  
    else if (id > (this?.gridOptions?.api?.getLastDisplayedRow() || 0))
      id = this?.gridOptions?.api?.getLastDisplayedRow() || 0; 

    let ds = 0;
    this.gridOptions?.api?.forEachNode(function(node) {
      if (node.rowIndex === id) {
        node.setSelected(true);
        ds = node.rowIndex;
      }
    });

    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, "idDossier"));
  }

  private nextPage(){
    this?.gridOptions?.api?.paginationGoToNextPage();
    let selectedCell = this?.gridOptions?.api?.getSelectedNodes()[0];
    let pageSize = this?.gridOptions?.api?.paginationGetPageSize();
    this?.gridOptions?.api?.getFirstDisplayedRow();
    if(selectedCell && pageSize) this.giveFocusToRow(selectedCell.rowIndex + pageSize);
  }

  private previousPage(){
    this?.gridOptions?.api?.paginationGoToPreviousPage();
    let selectedCell = this?.gridOptions?.api?.getSelectedNodes()[0];
    let pageSize = this?.gridOptions?.api?.paginationGetPageSize();
    if(selectedCell && pageSize) this.giveFocusToRow(selectedCell.rowIndex - pageSize);
  }

  // private dateToString(params: ValueFormatterParams): string {
  //   let date = new DateTime(params.value as Date);
  //   return (date).toString();
  // }

  private reinitGrid(){
    (this.gridOptions.api as GridApi).resetQuickFilter();
    (this.gridOptions.api as GridApi).deselectAll();
    (this.gridOptions.api as GridApi).setFilterModel(null);
    (this.gridOptions.api as GridApi).paginationGoToPage(0);
  }

  private sendDossier(dossier: DossierSearch) {
    this.filtreDossier = "";
    this.dialog = false;
    this.resolve(dossier);
  }

  private close(){
    this.filtreDossier = "";
    this.dialog = false;
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
