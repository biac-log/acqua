<template>
  <v-dialog v-model="dialog" max-width="750" transition="dialog-transition">
    <v-card>
      <v-toolbar
        ><v-card-title> Comptes pour les saisies financières</v-card-title> <v-spacer /><v-btn></v-btn
      ></v-toolbar>
      <v-card-text>
        <AgGridVue
        style="height: 730px;"
        id="dataTable"
        class="ag-theme-alpine"
        :columnDefs="headers"
        :rowData="paramsFinanciers"
        rowSelection="single"
        :gridOptions="gridOptions"
      >
      </AgGridVue>
        <!-- <v-data-table :items="paramsFinanciers" :headers="headers" @dblclick:row="selectCompte"
          ><template v-slot:[`item.key`]="{ item }">
            <span>{{ item.key.replace(/([a-z])([A-Z])/g, '$1 $2') }}</span>
          </template></v-data-table
        > -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ApplicationModule } from '@/store/modules/application';
import { Component, Vue } from 'vue-property-decorator';
import { CompteSimple } from '@/models/Financier/Get/CompteSimple';
import { GridOptions} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue';
import { ParametreFinancier } from '@/models/ParametreFinancier';

@Component({
  name: 'CompteGeneralSuggestion',
  components: {AgGridVue}
})
export default class CompteGeneralSuggestion extends Vue {
  private dialog = false;
  private paramsFinanciers = ApplicationModule.parametresFinanciers;
  private headers = [
    { headerName: 'Type', field: 'key', filter: true, width: 120 },
    { headerName: 'N° Compte', field: 'numeroCompte', filter: true, flex: 1 },
    { headerName: 'Libellé', field: 'libelle', filter: true, width: 120 },
  ];

  private gridOptions: GridOptions = {
    columnDefs: this.headers,
    rowSelection: 'single',
    rowData: this.paramsFinanciers,
    navigateToNextCell: this.navigateToNextCell,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    pagination: true,
    // paginationAutoPageSize: true,
    onRowDoubleClicked: this.rowDoubleClick,
    paginationPageSize: 15
  };

  private resolve!: any;
  private reject!: any;

  public open(): Promise<ParametreFinancier> {
    this.dialog = true;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private selectCompte(compte: ParametreFinancier) {
    this.resolve(compte);
    this.dialog = false;
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
      const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as ParametreFinancier;
      this.selectCompte(selectedRow);
    }
  }

  private rowDoubleClick() {
    const selectedRow = this?.gridOptions?.api?.getSelectedRows()[0] as ParametreFinancier;
    this.selectCompte(selectedRow);
  }
}
</script>

<style>
</style>