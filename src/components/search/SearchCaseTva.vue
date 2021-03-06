<template>
  <v-dialog width="700" v-model="dialog" @click:outside="close" @keydown.esc="close()">
    <v-card :loading="isLoading">
      <v-card-title>
        Case Tva
        <v-btn color="primary" fab class="ml-5" small @click="refreshcasesTva">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreCaseTva"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          @keydown.down.prevent="giveFocusToRow(0)"
          autocomplete="off"
          outlined
        ></v-text-field>
        <v-btn
          color="error"
          fab
          small
          class="ml-5"
          @click="close"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>
      <AgGridVue
        style="height: 730px;"
        id="dataTable"
        class="ag-theme-alpine"
        :columnDefs="headersCasesTva"
        :rowData="casesTva"
        rowSelection="single"
        :gridOptions="gridOptions"
      >
      </AgGridVue>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { CaseTva } from '@/models/CaseTva';
import { GridOptions, ICellRenderer, GridApi } from 'ag-grid-community';
import CaseTvaApi from '@/api/CaseTvaApi';
import { CaseTvaNature } from '@/models/CaseTva/CaseTvaNature';

@Component({
  name: 'SearchCaseTva',
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog = false;

  private numeroJournalLoad!: number;
  private filtreCaseTva = '';
  private isLoading = false;
  private casesTva: CaseTva[] = [];
  private headersCasesTva = [
    { headerName: 'Numéro case', field: 'numeroCase', cellStyle: { textAlign: 'right' }, width: 120 },
    { headerName: 'Libellé', field: 'libelleCase', flex: 1 },
    { headerName: 'Type', field: 'libelleTypeCase', width: 120 },
    { headerName: 'Nature', field: 'libelleNatureCase', width: 180 },
    { headerName: 'Taux', field: 'tauxTvaCase', cellStyle: { textAlign: 'right' }, width: 120 }
  ];
  private casesTvaNatures: CaseTvaNature[] = [];

  private resolve!: any;
  private reject!: any;

  private loadingCellRenderer: string | undefined | (new () => ICellRenderer) = undefined;
  private loadingCellRendererParams = null;
  private gridOptions: GridOptions = {
    columnDefs: this.headersCasesTva,
    rowSelection: 'single',
    rowData: this.casesTva,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    onRowDoubleClicked: this.rowDoubleClick,
    paginationPageSize: 15
  };

  public open(numeroJournal: number): Promise<CaseTva> {
    this.dialog = true;
    this.loadcasesTva(numeroJournal);
    this.loadCaseTvaNatures();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadcasesTva(numeroJournalLoad: number) {
    if (this.numeroJournalLoad != numeroJournalLoad) {
      this.numeroJournalLoad = numeroJournalLoad;
      this.refreshcasesTva();
    }
  }

  private async loadCaseTvaNatures() {
    if (this.casesTvaNatures.isEmpty()) this.casesTvaNatures = await CaseTvaApi.getNatures();
  }

  private refreshcasesTva() {
    if (this.numeroJournalLoad) {
      this.isLoading = true;
      (this.gridOptions.api as GridApi)?.showLoadingOverlay();
      CaseTvaApi.getCasesTVADisponibles(this.numeroJournalLoad)
        .then((resp) => {
          this.casesTva = resp;
        })
        .finally(() => {
          (this.gridOptions.api as GridApi)?.hideOverlay();
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
    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, 'numeroCase'));
  }

  @Watch('filtreCaseTva')
  private filterGrid() {
    this.gridOptions?.api?.setQuickFilter(this.filtreCaseTva);
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
        console.log('this will never happen, navigation is always one of the 4 keys above');
    }
  }

  private keypress(event: any) {
    if (event?.event.key === 'Enter') {
      const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CaseTva;
      this.sendCaseTva(selectedRow);
    }
  }

  private rowDoubleClick() {
    const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CaseTva;
    this.sendCaseTva(selectedRow);
  }

  private reinitGrid() {
    (this.gridOptions.api as GridApi).resetQuickFilter();
    (this.gridOptions.api as GridApi).deselectAll();
    (this.gridOptions.api as GridApi).setFilterModel(null);
    (this.gridOptions.api as GridApi).paginationGoToPage(0);
  }

  private sendCaseTva(caseTva: CaseTva) {
    this.filtreCaseTva = '';
    this.dialog = false;
    this.resolve(caseTva);
  }

  private close() {
    this.filtreCaseTva = '';
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
