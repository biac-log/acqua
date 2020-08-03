<template>
  <v-dialog width="1200" 
            v-model="dialog" 
            @click:outside="close()" 
            @keydown.esc="close()" 
            @keydown.page-up="nextPage()" 
            @keydown.page-down="previousPage()"
            @keydown.ctrl.f.prevent="focusSearch()">
    <v-card :loading="isLoading">
      <v-card-title>
        Echeanciers
        <v-btn color="primary" fab small class="ml-5" @click="refreshEcheancier">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreEcheancier"
          ref="filterFiled"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          @keydown.down.prevent="giveFocusToRow(0)"
          autocomplete="off"
        ></v-text-field>
      </v-card-title>
      <AgGridVue 
        style="height: 561px;"
        id="dataTable"
        class="ag-theme-alpine"
        :columnDefs="headersEcheanciers"
        :rowData="echeanciers"
        :gridOptions="gridOptions">
      </AgGridVue>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AgGridVue } from "ag-grid-vue";
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import axios from "axios";
import { GridOptions, ICellRenderer, GridApi, ValueFormatterParams } from 'ag-grid-community';
import { FinancierApi } from '../../../api/FinancierApi';
import { EcheancierApi } from "@/api/EcheancierApi";
import { Echeancier, EcheancierElement } from '../../../models/Echeancier';
import { DateTime } from '@/models/DateTime';
import _ from 'lodash';    

@Component({
  name: "SearchEcheancier",
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog: boolean = false;

  private typeLoad!: string;
  private numeroEcheancierToLoad!: string;

  private filtreEcheancier: string = "";
  private isLoading: boolean = false;
  private echeanciers: EcheancierElement[] = [];
  private headersEcheanciers = [
    { 
      headerName: "Piece", 
      field: "libellePiece", 
      filter: true, 
      width: 160,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true, 
    },
    { headerName: "Type", field: "typePiece", filter:true, width: 150 },
    { headerName: "Date", field: "datePieceDate", filter:true, width: 120, type: 'dateColumn', valueFormatter: this.dateToString },
    { headerName: "Montant", field: "montant", filter:true, width: 140, type: 'numericColumn', valueFormatter: this.numberToString },
    { headerName: "Libelle", field: "libelle", filter:true, width: 200, type: 'dateColumn' },
    { headerName: "Date échéance", field: "dateEcheanceDate", filter:true, width: 120, valueFormatter: this.dateToString },
    { headerName: "Solde", field: "solde", filter:true, width: 140, type: 'numericColumn', valueFormatter: this.numberToString },
    { headerName: "Dépassement", field: "depassement", filter:true, flex:1, type: 'numericColumn' }
  ];

  private resolve!: any;
  private reject!: any;

  private gridOptions: GridOptions = {
    columnDefs: this.headersEcheanciers,
    rowSelection: "multiple",
    rowDeselection: true,
    rowData: this.echeanciers,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    navigateToNextCell: this.navigateToNextCell,
    pagination: true,
    paginationAutoPageSize:true,
    suppressRowClickSelection: true,
    enableSorting: true,
    columnTypes: {
      'dateColumn': {
        filter: 'agDateColumnFilter',
        suppressMenu: true
      }
    },
    getRowStyle: function(params: any) {
      if (params.node.data.isLastRow && params.node.data.echu)
        return { "border-bottom": "1px solid black", "background-color": "#ffd6cc" };  
      else if (params.node.data.isLastRow)
        return { "border-bottom": "1px solid black" };  
    }
  };

  public open(typeToLoad: string, numeroEcheancierToLoad: string): Promise<EcheancierElement[]> {
    this.dialog = true;
    this.loadEcheancier(typeToLoad, numeroEcheancierToLoad);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadEcheancier(typeToLoad: string, numeroEcheancierToLoad: string) {
    if (this.typeLoad != typeToLoad || this.numeroEcheancierToLoad != numeroEcheancierToLoad) {
      this.typeLoad = typeToLoad;
      this.numeroEcheancierToLoad = numeroEcheancierToLoad;
      this.refreshEcheancier();
    }
  }

  private refreshEcheancier() {
    if (this.typeLoad) {
      this.isLoading = true;
      EcheancierApi.getEcheancierForCompteTiers(this.typeLoad, this.numeroEcheancierToLoad)
        .then(resp => {
          this.initGrid(resp.elements);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private initGrid(elements: EcheancierElement[]){
    _(elements).groupBy(e => `${e.numeroJournalPrincipal}${e.numeroPiecePrincipal}`).forEach(elementsGrouped => {
      elementsGrouped[elementsGrouped.length -1].isLastRow = true;
    });

    this.echeanciers = elements;
  }

  private giveFocusToRow(id: number) {
    let ds = 0;
    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, "typePiece"));
  }

  @Watch("filtreEcheancier")
  private filterGrid(){
    this.gridOptions?.api?.setQuickFilter(this.filtreEcheancier);
  }
  
  private numberToString(params: ValueFormatterParams): string {
    return (params.value as number).toDecimalString(2);
  }

  private dateToString(params: ValueFormatterParams): string {
    let date = new DateTime(params.value as Date);
    return date.toString();
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
        return suggestedNextCell;
      case KEY_UP:
        if(previousCell.rowIndex == 0)
          this.focusSearch();
        else{
          previousCell = params.previousCellPosition;
          // set selected cell on current cell - 1
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
    this.$nextTick(() => (this.$refs.filterFiled as any).focus());
  }

  private keypress(event: any) {
    if(event?.event.key === "Enter"){
      var selectedRows = this?.gridOptions?.api?.getSelectedRows() as EcheancierElement[];
      this.sendEcheancier(selectedRows)
    }
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

  private sendEcheancier(compte: EcheancierElement[]) {
    this.filtreEcheancier = "";
    this.dialog = false;
    this.reinitGrid();
    this.resolve(compte);
  }

  private close(){
    this.filtreEcheancier = "";
    this.dialog = false;
    this.reinitGrid();
    this.reject();
  }
}
</script>

<style>

</style>
