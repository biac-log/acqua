<template>
  <v-dialog
    width="1100"
    v-model="dialog"
    @click:outside="close()"
    @keydown.esc="close()"
    @keydown.page-down="nextPage()"
    @keydown.page-up="previousPage()"
    @keydown.ctrl.f.prevent="focusSearch()"
  >
    <v-card :loading="isLoading">
      <v-card-title>
        Comptes
        <v-btn color="primary" fab small class="ml-5" @click="refreshComptes">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          ref="filterField"
          v-model="filtreCompte"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          @keydown.down.prevent="giveFocusToFirstDisplayRow()"
          autocomplete="off"
          outlined
        ></v-text-field>
      </v-card-title>
      <AgGridVue
        style="height: 600px;"
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
import { GridOptions, GridApi } from 'ag-grid-community';
import CompteApi from '@/api/CompteApi';

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
    { headerName: 'Bloqué', field: 'compteBloqueDisplay', filter: true, width: 100 }
  ];

  private resolve!: any;
  private reject!: any;

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

  public open(typeToLoad: string, filter: string): Promise<CompteSearch> {
    this.dialog = true;
    this.filtreCompte = filter;
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
          this.$nextTick(() => {
            this.filterGrid(this.filtreCompte);
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  @Watch('filtreCompte')
  private filterGrid(newValue: string) {
    const numeroFilterComponent = this.gridOptions?.api?.getFilterInstance('numero');
    if (newValue && newValue.isInt()) {
      numeroFilterComponent?.setModel({ type: 'contains', filter: newValue });
    } else {
      numeroFilterComponent?.setModel({ type: 'startsWith', filter: '' });
    }
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
        if (previousCell.rowIndex == 0) {
          this.focusSearch();
          break;
        } else {
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

  private focusSearch() {
    (this.gridOptions.api as GridApi).deselectAll();
    this.$nextTick(() => (this.$refs.filterField as any).focus());
  }

  private giveFocusToFirstDisplayRow() {
    const rowToFocus = this?.gridOptions?.api?.getFirstDisplayedRow() || 0;
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

    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(ds, 'numero'));
  }

  private nextPage() {
    this?.gridOptions?.api?.paginationGoToNextPage();
    const selectedCell = this?.gridOptions?.api?.getSelectedNodes()[0];
    const pageSize = this?.gridOptions?.api?.paginationGetPageSize();
    this?.gridOptions?.api?.getFirstDisplayedRow();
    if (selectedCell && pageSize) this.giveFocusToRow(selectedCell.rowIndex + pageSize);
  }

  private previousPage() {
    this?.gridOptions?.api?.paginationGoToPreviousPage();
    const selectedCell = this?.gridOptions?.api?.getSelectedNodes()[0];
    const pageSize = this?.gridOptions?.api?.paginationGetPageSize();
    if (selectedCell && pageSize) this.giveFocusToRow(selectedCell.rowIndex - pageSize);
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
