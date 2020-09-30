<template>
  <v-dialog
    width="1100"
    v-model="dialog"
    @click:outside="close()"
    @keydown.esc="close()"
    @keydown.page-up="nextPage()"
    @keydown.page-down="previousPage()"
    @keydown.ctrl.f.prevent="focusSearch()"
  >
    <v-card :loading="isLoading">
      <v-card-title>
        {{ title }}
        <v-btn color="primary" fab small class="ml-5" @click="refreshItems">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          ref="filterField"
          v-model="filtreItems"
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
        :columnDefs="headersItems"
        :rowData="items"
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
import RepresentantApi from '@/api/RepresentantApi';
import { Representant } from '@/models/Representant/Representant';

@Component({
  name: 'SearchCompteTier',
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog = false;

  private typeLoad!: string;
  private filtreItems = '';
  private isLoading = false;
  private title = '';
  private itemsName = '';
  private items: Representant[] = [];
  private headersItems = [
    { headerName: '', field: '', filter: true, width: 120 },
    { headerName: '', field: '', filter: true, width: 300 },
    { headerName: '', field: '', filter: true, width: 140 },
    { headerName: '', field: '', filter: true, flex: 1 }
  ];
  private headersRepresentants = [
    { headerName: 'Code', field: 'code', filter: true, width: 120 },
    { headerName: 'Nom', field: 'nom', filter: true, width: 300 },
    { headerName: 'Raison sociale', field: 'raisonSocial', filter: true, width: 140 },
    { headerName: 'Adresse', field: 'adresse', filter: true, flex: 1 }
  ];

  private resolve!: any;
  private reject!: any;

  private gridOptions: GridOptions = {
    columnDefs: this.headersItems,
    rowSelection: 'single',
    rowData: this.items,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    overlayLoadingTemplate: `<span class="ag-overlay-loading-center">Chargement des ${this.itemsName}</span>`,
    pagination: true,
    paginationAutoPageSize: true,
    onRowDoubleClicked: this.rowDoubleClick,
    getRowStyle(params: any) {
      if (params.node.data.compteBloque) return { 'background-color': '#ffd6cc' };
    }
  };

  public open(typeToLoad: string): Promise<{ code: string; numeroNom: string; nom: string }> {
    this.loadItems(typeToLoad);
    switch (typeToLoad) {
      case 'codeRepresentant':
        this.title = 'Représentants';
        this.itemsName = 'représentants';
        this.headersItems = this.headersRepresentants;
        break;

      default:
        break;
    }

    this.dialog = true;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadItems(typeToLoad: string) {
    if (this.typeLoad != typeToLoad) {
      this.typeLoad = typeToLoad;
      this.refreshItems();
    }
  }

  private refreshItems() {
    if (this.typeLoad) {
      this.isLoading = true;
      switch (this.typeLoad) {
        case 'codeRepresentant':
          RepresentantApi.getAllRepresentants()
            .then((resp) => {
              this.items = resp;
            })
            .finally(() => {
              this.isLoading = false;
            });
          break;

        default:
          break;
      }
    }
  }

  @Watch('filtreItems')
  private filterGrid() {
    this.gridOptions?.api?.setQuickFilter(this.filtreItems);
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
      const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0];
      this.sendItem(selectedRow);
    }
  }

  private rowDoubleClick() {
    const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0];
    this.sendItem(selectedRow);
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

  private sendItem(item: Representant) {
    this.filtreItems = '';
    this.dialog = false;
    this.reinitGrid();
    this.resolve({
      code: item.code,
      nom: item.nom,
      numeroNom: `${item.code} - ${item.nom}`
    });
  }

  private close() {
    this.filtreItems = '';
    this.dialog = false;
    this.reinitGrid();
    this.reject();
  }
}
</script>

<style></style>
