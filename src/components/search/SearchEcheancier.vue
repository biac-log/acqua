<template>
  <v-dialog
    width="1560"
    v-model="dialog"
    @click:outside="close()"
    @keydown.esc="close()"
    @keydown.page-down="nextPage()"
    @keydown.page-up="previousPage()"
    @keydown.ctrl.f.prevent="focusSearch()"
  >
    <v-card :loading="isLoading">
      <v-card-title>
        Échéancier : {{ nomCompte }}
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
          outlined
        ></v-text-field>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="2">
            <v-text-field
              label="Solde"
              v-model="allEcheanciers.soldeDisplay"
              hide-details
              tabindex="-1"
              readonly
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              label="Numéro tél."
              v-model="allEcheanciers.numeroTelephone"
              hide-details
              tabindex="-1"
              readonly
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              label="Montant échu"
              v-model="allEcheanciers.montantEchuDisplay"
              hide-details
              tabindex="-1"
              readonly
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              label="Montant non échu"
              v-model="allEcheanciers.montantNonEchuDisplay"
              hide-details
              tabindex="-1"
              readonly
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              label="Condition paiement"
              v-model="allEcheanciers.conditionPaiement"
              filled
              hide-details
              tabindex="-1"
              readonly
              outlined
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text class="pb-0">
        <v-row dense class="ml-1">
          <v-btn small color="primary" @click="detailIsVisible = !detailIsVisible">
            <template v-if="detailIsVisible">Voir les pièces principales</template>
            <template v-else>Voir le détail</template>
          </v-btn>
          <v-checkbox
            label="Uniquement les pièces non soldées"
            class="pa-0 ma-0 ml-5 mt-1"
            v-model="isNotSolde"
            hide-details
          ></v-checkbox>
          <v-radio-group v-model="montantAffiche" row class="pa-0 ma-0 ml-5 mt-1" hide-details>
            <v-radio label="Montant devise" value="devise"></v-radio>
            <v-radio label="Montant compta" value="base"></v-radio>
          </v-radio-group>
          <v-spacer></v-spacer>
          <div class="text-h6">
            Reste à ventiler :
            <b :class="resteAVentile > 0 ? 'amountPositive' : 'amountNull'">
              {{ resteAVentile | numberToStringEvenZero }}
            </b>
          </div>
        </v-row>
        <v-row>
          <v-col cols="12">
            <AgGridVue
              style="height: 561px;"
              id="dataTable"
              class="ag-theme-alpine"
              :columnDefs="headersEcheanciers"
              :rowData="echeanciers"
              :gridOptions="gridOptions"
              @selection-changed="calculAVentile"
              @grid-ready="onGridReady"
            ></AgGridVue>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pb-0 pt-0">
        <v-spacer></v-spacer>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn ref="btnValidate" class="ma-2 pr-4" tile color="success" @click="sendEcheancier" v-on="on">
              <v-icon left>mdi-check</v-icon>Valider
            </v-btn>
          </template>
          <span>
            Valider la sélection
            <span class="shortcutTooltip">enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { GridOptions, GridApi, ValueFormatterParams } from 'ag-grid-community';
import EcheancierApi from '@/api/EcheancierApi';
import { Echeancier, EcheancierElement } from '@/models/Echeancier';
import { DateTime } from '@/models/DateTime';
import _ from 'lodash';

@Component({
  name: 'SearchEcheancier',
  components: { AgGridVue }
})
export default class extends Vue {
  private dialog = false;

  @PropSync('MontantAVentileDevise', { default: 0 }) private montantAVentileDevise!: number;
  @PropSync('MontantAVentileBase', { default: 0 }) private montantAVentileBase!: number;

  private typeLoad!: string;
  private numeroEcheancierToLoad!: string;
  private nomCompte = '';

  private filtreEcheancier = '';
  private isLoading = false;
  private echeanciers: EcheancierElement[] = [];
  private allEcheanciers = new Echeancier();
  private headersEcheanciers = [
    {
      headerName: 'Piece',
      field: 'libellePiece',
      filter: true,
      width: 140,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      type: 'rightAligned'
    },
    { headerName: 'PiecePrincipale', field: 'isPiecePrincipale', filter: true, width: 150, hide: true },
    { headerName: 'Type', field: 'typePiece', filter: true, width: 150 },
    {
      headerName: 'Date',
      field: 'datePieceDate',
      filter: true,
      width: 120,
      type: 'dateColumn',
      valueFormatter: this.dateToString
    },
    {
      headerName: 'Montant',
      field: 'montantDevise',
      filter: true,
      width: 140,
      type: 'numericColumn',
      valueFormatter: this.montantDeviseToString
    },
    {
      headerName: 'Montant',
      field: 'montantBase',
      filter: true,
      width: 140,
      type: 'numericColumn',
      valueFormatter: this.montantBaseToString,
      hide: true
    },
    { headerName: 'Libelle', field: 'libelle', filter: true, width: 150, type: 'dateColumn' },
    {
      headerName: 'Date échéance',
      field: 'dateEcheanceDate',
      filter: true,
      width: 120,
      valueFormatter: this.dateToString
    },
    {
      headerName: 'Solde',
      field: 'soldeDevise',
      filter: true,
      width: 140,
      type: 'numericColumn',
      valueFormatter: this.montantDeviseToString
    },
    {
      headerName: 'Solde',
      field: 'soldeBase',
      filter: true,
      width: 140,
      type: 'numericColumn',
      valueFormatter: this.montantBaseToString,
      hide: true
    },
    { headerName: 'Rappel', field: 'rappel', filter: true, width: 100, type: 'numericColumn' },
    { headerName: 'Code bloc.', field: 'codeBlocageDisplay', filter: true, width: 150 }
  ];

  private resolve!: any;
  private reject!: any;

  private gridOptions: GridOptions = {
    columnDefs: this.headersEcheanciers,
    rowSelection: 'multiple',
    rowDeselection: true,
    rowData: this.echeanciers,
    suppressHorizontalScroll: true,
    onCellKeyDown: this.keypress,
    navigateToNextCell: this.navigateToNextCell,
    pagination: true,
    // paginationAutoPageSize: true,
    paginationPageSize: 15,
    suppressRowClickSelection: true,
    enableSorting: true,
    columnTypes: {
      dateColumn: {
        filter: 'agDateColumnFilter',
        suppressMenu: true
      }
    },
    getRowStyle(params: any) {
      if (params.node.data.isLastRow) return { 'border-bottom': '1px solid black' };
    },
    isRowSelectable(rowNode) {
      return rowNode.data ? rowNode.data.isPiecePrincipale : false;
    },
    postSort(rowNodes) {
      function move(toIndex: any, fromIndex: any) {
        rowNodes.splice(toIndex, 0, rowNodes.splice(fromIndex, 1)[0]);
      }

      let nextInsertPos = 0;
      for (let i = 0; i < rowNodes.length; i++) {
        if (rowNodes[i].data.isPiecePrincipale) {
          const piecePrincipal = rowNodes[i].data as EcheancierElement;
          const childs = rowNodes.filter(
            (r) =>
              r.data.numeroJournalPrincipal == piecePrincipal.numeroJournal &&
              r.data.numeroPiecePrincipal == piecePrincipal.numeroPiece &&
              !r.data.isPiecePrincipale
          );
          move(nextInsertPos, i);
          nextInsertPos++;
          for (let j = 0; j < childs.length; j++) {
            childs[j].data.isLastRow = j == childs.length - 1;
            move(nextInsertPos, rowNodes.indexOf(childs[j]));
            nextInsertPos++;
          }
        }
      }
    }
  };

  public open(typeToLoad: string, numeroEcheancierToLoad: string, nomCompte: string): Promise<EcheancierElement[]> {
    this.dialog = true;
    this.nomCompte = nomCompte;
    this.calculAVentile();
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
        .then((resp) => {
          this.allEcheanciers = resp;
          this.refreshGridElements();
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private isNotSolde = true;
  private detailIsVisible = false;
  private montantAffiche = 'devise';
  @Watch('montantAffiche')
  private montantAfficheChange() {
    this.gridOptions?.columnApi?.setColumnsVisible(['soldeDevise', 'montantDevise'], this.montantAffiche == 'devise');
    this.gridOptions?.columnApi?.setColumnsVisible(['soldeBase', 'montantBase'], this.montantAffiche == 'base');
    this.calculAVentile();
  }

  @Watch('isNotSolde')
  @Watch('detailIsVisible')
  private refreshGridElements() {
    if (this.allEcheanciers) {
      const elements: EcheancierElement[] = [];
      if (this.detailIsVisible) {
        _(this.allEcheanciers.elements)
          .groupBy((e) => `${e.numeroJournalPrincipal}${e.numeroPiecePrincipal}`)
          .orderBy((e) => e.filter((e) => e.isPiecePrincipale)[0].dateEcheanceDate)
          .forEach((elementsGrouped) => {
            elementsGrouped[elementsGrouped.length - 1].isLastRow = true;
            if (this.isNotSolde) {
              if (!elementsGrouped.filter((e) => e.isPiecePrincipale)[0].isSolde)
                elementsGrouped.forEach((e) => elements.push(e));
            } else elementsGrouped.forEach((e) => elements.push(e));
          });
      } else {
        _(this.allEcheanciers.elements)
          .groupBy((e) => `${e.numeroJournalPrincipal}${e.numeroPiecePrincipal}`)
          .orderBy((e) => e.filter((e) => e.isPiecePrincipale)[0].dateEcheanceDate)
          .forEach((elementsGrouped) => {
            elementsGrouped[elementsGrouped.length - 1].isLastRow = true;
            if (this.isNotSolde) {
              if (!elementsGrouped.filter((e) => e.isPiecePrincipale)[0].isSolde)
                elements.push(elementsGrouped.filter((e) => e.isPiecePrincipale)[0]);
            } else elements.push(elementsGrouped.filter((e) => e.isPiecePrincipale)[0]);
          });
      }
      this.echeanciers = elements;
    }
  }

  private giveFocusToRow(id: number) {
    this.$nextTick(() => this.gridOptions?.api?.setFocusedCell(id, 'typePiece'));
  }

  @Watch('filtreEcheancier')
  private filterGrid() {
    this.gridOptions?.api?.setQuickFilter(this.filtreEcheancier);
  }

  private resteAVentile = 0;
  private calculAVentile() {
    const rowSelected = this.gridOptions?.api?.getSelectedNodes();
    if (!rowSelected?.length)
      this.resteAVentile = this.montantAffiche == 'devise' ? this.montantAVentileDevise : this.montantAVentileBase;
    else if (this.montantAffiche == 'devise') {
      this.resteAVentile =
        this.montantAVentileBase -
        Math.abs(
          _(rowSelected)
            .map((r) => r.data.montantDevise)
            .sum()
        );
    } else {
      this.resteAVentile =
        this.montantAVentileBase -
        Math.abs(
          _(rowSelected)
            .map((r) => r.data.montantBase)
            .sum()
        );
    }
  }

  private montantDeviseToString(params: ValueFormatterParams): string {
    if (params.value) return `${(params.value as number).montantNegatifString(2)} ${params.data.libelleDevise}`;
    else return '';
  }

  private montantBaseToString(params: ValueFormatterParams): string {
    if (params.value) return `${(params.value as number).toComptaString(2)} EUR`;
    else return '';
  }

  private dateToString(params: ValueFormatterParams): string {
    const date = new DateTime(params.value as Date);
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
        if (previousCell.rowIndex == 0) {
          this.focusSearch();
          break;
        } else {
          previousCell = params.previousCellPosition;
          // set selected cell on current cell - 1
          return suggestedNextCell;
        }
      case KEY_LEFT:
      case KEY_RIGHT:
        return suggestedNextCell;
      default:
        console.log('this will never happen, navigation is always one of the 4 keys above');
    }
  }

  private focusSearch() {
    this.$nextTick(() => (this.$refs.filterFiled as any).focus());
  }

  private keypress(event: any) {
    if (event?.event.key === 'Enter') {
      this.sendEcheancier();
    }
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

  private sendEcheancier() {
    const comptes = this?.gridOptions?.api?.getSelectedRows() as EcheancierElement[];
    if (!comptes?.length) this.close();
    else {
      this.filtreEcheancier = '';
      this.dialog = false;
      this.reinitGrid();
      this.resolve(comptes);
    }
  }

  private onGridReady() {
    (this.gridOptions.api as GridApi).sizeColumnsToFit();
  }

  private close() {
    this.filtreEcheancier = '';
    this.dialog = false;
    this.reinitGrid();
    this.reject();
  }
}
</script>

<style scoped>
.amountPositive {
  color: orange;
}
.amountNull {
  color: green;
}
</style>
