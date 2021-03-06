<template>
  <v-dialog
    width="1100"
    v-model="dialog"
    @click:outside="close()"
    @keydown.esc="close()"
    @keydown.page-down="nextPage()"
    @keydown.page-up="previousPage()"
  >
    <v-card class="mt-5" :loading="isLoading">
      <v-card-title>
        Comptes
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
          @keydown.down.prevent="giveFocusToRow(0)"
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
        :gridOptions="gridOptions"
      >
      </AgGridVue>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import CompteApi from '@/api/CompteApi';
import { GridOptions, ICellRenderer, GridApi } from 'ag-grid-community';

@Component({
  name: 'SearchCompteTier',
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog = false;

  private typeLoad!: string;
  private filtreCompte = '';
  private isLoading = false;
  private comptes: CompteSearch[] = [];
  private headersComptes = [
    { headerName: 'Numéro', field: 'numero', filter: true, width: 120 },
    { headerName: 'Nom', field: 'nom', filter: true, width: 300 },
    { headerName: 'Raison sociale', field: 'raisonSocial', filter: true, width: 140 },
    { headerName: 'Adresse', field: 'adresse', filter: true, flex: 1 },
    { headerName: 'Code TVA', field: 'codeTVAIntracommunautaire', filter: true, width: 180 },
    { headerName: 'Bloqué', field: 'compteBloqueDisplay', filter: true, width: 100 }
  ];

  private resolve!: any;
  private reject!: any;

  private loadingCellRenderer: string | undefined | (new () => ICellRenderer) = undefined;
  private loadingCellRendererParams = null;
  private gridOptions: GridOptions = {
    columnDefs: this.headersComptes,
    rowSelection: 'single',
    rowData: this.comptes,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Chargement des comptes</span>',
    pagination: true,
    // paginationAutoPageSize: true,
    paginationPageSize: 15,
    onRowDoubleClicked: this.rowDoubleClick,
    getRowStyle(params: any) {
      if (params.node.data.compteBloque) return { 'background-color': '#ffd6cc' };
    }
  };

  public open(typeToLoad: string): Promise<CompteSearch> {
    this.dialog = true;
    this.loadComptes(typeToLoad);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadComptes(typeToLoad: string) {
    if (this.typeLoad != typeToLoad) {
      this.typeLoad = typeToLoad;
      this.refreshComptes();
    }
  }

  private refreshComptes() {
    if (this.typeLoad) {
      this.isLoading = true;
      CompteApi.getComptesTiers(this.typeLoad)
        .then((resp) => {
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
    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, 'numero'));
  }

  @Watch('filtreCompte')
  private filterGrid() {
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
        console.log('this will never happen, navigation is always one of the 4 keys above');
    }
  }

  private keypress(event: any) {
    if (event?.event.key === 'Enter') {
      const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CompteSearch;
      this.sendCompte(selectedRow);
    }
  }

  private rowDoubleClick() {
    const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as CompteSearch;
    this.sendCompte(selectedRow);
  }

  private nextPage() {
    this?.gridOptions?.api?.paginationGoToNextPage();
  }

  private previousPage() {
    this?.gridOptions?.api?.paginationGoToPreviousPage();
  }

  private reinitGrid() {
    (this.gridOptions.api as GridApi).resetQuickFilter();
    (this.gridOptions.api as GridApi).deselectAll();
    (this.gridOptions.api as GridApi).setFilterModel(null);
    (this.gridOptions.api as GridApi).paginationGoToPage(0);
  }

  private sendCompte(compte: CompteSearch) {
    this.filtreCompte = '';
    this.dialog = false;
    this.reinitGrid();
    this.resolve(compte);
  }

  private close() {
    this.filtreCompte = '';
    this.dialog = false;
    this.reinitGrid();
    this.reject();
  }
}
</script>

<style></style>
