<template>
  <v-container fluid @keydown.107.prevent="createNewPieceComptable" >
    <v-card>
      <v-form ref="form" v-model="searchIsValid">
        <v-row align="start" justify="start" class="pl-5 pr-5">
          <v-col cols="12" xs="12" md="4" lg="2">
            <v-select
              autofocus
              label="Sélection de la période"
              outlined
              persistent-hint
              required
              return-object
              item-text="typePeriodeComptableLibelle"
              :items="periodes"
              v-model="periodeSelected"
              :loading="periodeIsLoading"
              :hint="periodeSelected.libellePeriode"
              :rules="periodesRules"
              @change="loadPiecesComptables"
            ></v-select>
          </v-col>
          <v-col cols="12" xs="12" md="6" lg="3">
            <v-select
              v-model="journalSelected"
              :items="journaux"
              label="Sélection du journal"
              outlined
              :loading="journauxIsLoading"
              item-text="fullLibelle"
              item-value="numero"
              :hint="journalSelected.description"
              return-object
              persistent-hint
              :rules="journalRules"
              @change="loadPiecesComptables"
              required
            >
            </v-select>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <v-card class="mt-5">
      <v-card-title>
        Pièces comptables
        <v-btn
          ref="btnAdd"
          color="warning"
          small
          fab
          class="ml-5"
          :disabled="!searchIsValid"
          @click.stop="createNewPieceComptable"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
          id="indexSearch"
          outlined
        ></v-text-field>
      </v-card-title>
      <v-data-table
        id="dataTable"
        :headers="headers"
        :items="piecesComptables"
        :search="search"
        :loading="isLoadingPieces"
        :options.sync="options"
        @click:row="openPieceComptable"
        :server-items-length="totalItems"
      >
        <template v-slot:[`item.pieceEquilibree`]="{ item }">
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-icon v-show="!item.pieceEquilibree" color="red" v-on="on">mdi-alert</v-icon>
            </template>
            <span>La pièce n'est pas équilibrée</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.numeroPiece`]="{ item }">
          <span>{{ item.numeroJournal }}.{{ item.numeroPiece }}</span>
        </template>
        <template v-slot:[`item.datePieceDate`]="{ item }">
          <span>{{ item.datePieceDate.toString() }}</span>
        </template>
        <template v-slot:[`item.soldeInitiale`]="{ item }">
          <span>{{ item.soldeInitiale | numberToComptaString }}</span>
        </template>
        <template v-slot:[`item.totalDebit`]="{ item }">
          <span>{{ item.totalDebit | numberToComptaString }}</span>
        </template>
        <template v-slot:[`item.totalCredit`]="{ item }">
          <span>{{ item.totalCredit | numberToComptaString }}</span>
        </template>
        <template v-slot:[`item.soldeFinale`]="{ item }">
          <span>{{ item.soldeFinale | numberToComptaString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <PieceComptableVue ref="refDialogPiece"></PieceComptableVue>
    <PieceAddResultVue ref="PieceAddResultVue" :SkipDialog.sync="skipAddResult"></PieceAddResultVue>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">{{ snackbarColor == 'error' ? 'mdi-delete' : 'mdi-check' }}</v-icon>
      <span v-html="snackbarMessage"></span>
      <v-btn icon dark @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { FinancierApi } from '../../api/FinancierApi';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { PeriodeComptable, Journal, EntetePieceComptable } from '@/models/Financier';
import { Pagination } from '@/models/Pagination';
import PieceComptableVue from './components/PieceComptable.vue';
import PieceAddResultVue from './components/PieceAddResult.vue';

@Component({
  name: 'Financier',
  components: { PieceComptableVue, PieceAddResultVue }
})
export default class extends Vue {
  @Ref() readonly refDialogPiece!: PieceComptableVue;
  @Ref() readonly PieceAddResultVue!: PieceAddResultVue;
  private searchIsValid = true;
  private skipAddResult = false;

  private isErrorPeriode = false;
  private periodeIsLoading = false;
  private periodes: PeriodeComptable[] = [];
  private periodeSelected: PeriodeComptable = new PeriodeComptable();
  private periodesRules: any = [
    () => !this.isErrorPeriode || 'Connexion impossible',
    (v: string) => !!v || 'La période est obligatoire'
  ];

  private isErrorJournaux = false;
  private journaux: Journal[] = [];
  private journauxIsLoading = false;
  private journalSelected: Journal = new Journal();
  private detailJournalSelected = '';
  private journalRules: any = [
    () => !this.isErrorJournaux || 'Connexion impossible',
    (v: Journal) => !!v || 'Sélection de journal obligatoire',
    (v: Journal) => v.numero != 0 || 'Sélection de journal obligatoire'
  ];

  private selectedPiece!: EntetePieceComptable;

  private headers = [
    { text: '', value: 'pieceEquilibree', width: 50 },
    { text: 'Numéro pièce', value: 'numeroPiece' },
    { text: 'Date pièce', value: 'datePieceDate' },
    { text: 'Solde initial', value: 'soldeInitiale', align: 'end' },
    { text: 'Débit', value: 'totalDebit', align: 'end' },
    { text: 'Crédit', value: 'totalCredit', align: 'end' },
    { text: 'Solde final', value: 'soldeFinale', align: 'end' }
  ];

  private search = '';
  private options: any = {};
  private piecesComptables: EntetePieceComptable[] = [];
  private totalItems = 0;
  private isLoadingPieces = false;

  mounted() {
    this.loadPeriodes();
    this.loadJournaux();
  }

  private async loadPeriodes() {
    try {
      this.periodeIsLoading = true;
      const periodes = await FinancierApi.getPeriodes();
      periodes.forEach((p) => this.periodes.push(p));
    } catch (err) {
      this.isErrorPeriode = true;
    } finally {
      this.periodeIsLoading = false;
    }
  }

  private async loadJournaux() {
    try {
      this.journauxIsLoading = true;
      const journaux = await FinancierApi.getJournaux();
      journaux.forEach((j) => this.journaux.push(j));
    } catch (err) {
      this.isErrorJournaux = true;
    } finally {
      this.journauxIsLoading = false;
    }
  }

  @Watch('options')
  onOptionsChanged() {
    this.loadPiecesComptables();
  }

  private async openPieceComptable(entete: EntetePieceComptable) {
    this.refDialogPiece
      .open(this.periodeSelected, this.journalSelected, entete.numeroPiece)
      .then((resp) => {
        if (resp) {
          this.notifier(`Pièce numéro <b>${resp}</b> mise à jour.`, 'success');
        } else {
          this.piecesComptables.splice(this.piecesComptables.indexOf(entete), 1);
          this.notifier(`Pièce numéro <b>${entete.codePieceDisplay}</b> supprimée.`, 'error');
        }
      })
      .catch()
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any).$el.focus());
      });
  }

  private createNewPieceComptable() {
    if (!this.searchIsValid) return false;
    this.refDialogPiece
      .openNew(this.periodeSelected, this.journalSelected)
      .then((resp) => {
        if(!this.skipAddResult) this.displayAddResult(resp);
        this.journalSelected.numeroDernierePiece = parseInt(resp);
        this.loadPiecesComptables();
      })
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private displayAddResult(numeroPiece: string) {
    (this.$refs.PieceAddResultVue as PieceAddResultVue)
      .open(this.journalSelected.numero, parseInt(numeroPiece), this.periodeSelected.typePeriodeComptable)
      .then((numero) => {
        if (parseInt(numeroPiece) != numero) {
          this.loadPiecesComptables();
        }
      })
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private async loadPiecesComptables() {
    try {
      if (this.periodeSelected.typePeriodeComptable && this.journalSelected.numero) {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        const pagination = new Pagination();
        pagination.terms = this.search;
        pagination.sortBy = sortBy;
        pagination.sortDesc = sortDesc;
        pagination.page = page;
        pagination.limit = itemsPerPage;

        this.isLoadingPieces = true;
        const paginationResult = await FinancierApi.getEntetePiecesComptables(
          this.journalSelected.numero,
          this.periodeSelected.typePeriodeComptable,
          pagination
        );
        this.piecesComptables = paginationResult.items.map((i) => new EntetePieceComptable(i));
        this.totalItems = paginationResult.totalCount;
      }
    } catch (err) {
      this.notifier(displayAxiosError(err), 'red');
    } finally {
      this.isLoadingPieces = false;
    }
  }

  private snackbar = false;
  private snackbarTimeout = 5000;
  private snackbarMessage = '';
  private snackbarColor = '';

  private notifier(message: string, color: string) {
    this.snackbarColor = color;
    this.snackbarMessage = message;
    this.snackbar = true;
  }
}
</script>

<style scopped>
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}
</style>
