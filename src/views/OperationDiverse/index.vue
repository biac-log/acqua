<template>
  <v-container fluid @keydown.107.prevent="createNewPieceComptable">
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
              item-text="libelle"
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
        <!-- <v-btn
          ref="btnAdd"
          color="warning"
          small
          fab
          class="ml-5"
          :disabled="!searchIsValid"
          @click.stop="createNewPieceComptable"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn> -->
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
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
        <template v-slot:[`item.isEquilibre`]="{ item }">
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-icon v-show="!item.isEquilibre" color="red" v-on="on">mdi-alert</v-icon>
            </template>
            <span>La pièce n'est pas équilibrée</span>
          </v-tooltip>
        </template>
        <template v-slot:[`item.numeroPiece`]="{ item }">
          <span>{{ item.numeroJournal }}.{{ item.numeroPiece }}</span>
        </template>
        <template v-slot:[`item.datePiece`]="{ item }">
          <span>{{ item.datePiece | dateToString }}</span>
        </template>
        <template v-slot:[`item.montantDebit`]="{ item }">
          <span>{{ item.montantDebit | numberToString }}</span>
        </template>
        <template v-slot:[`item.montantCredit`]="{ item }">
          <span>{{ item.montantCredit | numberToString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <!-- <PieceComptableVue ref="refDialogPiece"></PieceComptableVue>
    <PieceAddResultVue ref="PieceAddResultVue"></PieceAddResultVue> -->
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">{{ snackbarColor == 'error' ? 'mdi-delete' : 'mdi-check' }}</v-icon>
      <span v-html="snackbarMessage"></span>
      <template v-slot:action="{ attrs }">
        <v-btn icon dark @click="console.log(attrs)" v-bind="attrs"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import OperationDiverseApi from '@/api/OperationDiverseApi';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { PeriodeComptable, Journal, EntetePieceComptable } from '@/models/OperationDiverse';
import { Pagination } from '@/models/Pagination';
// import PieceComptableVue from './components/PieceComptable.vue';
// import PieceAddResultVue from './components/PieceAddResult.vue';

@Component({
  name: 'OperationDiverse'
  // components: { PieceComptableVue, PieceAddResultVue }
})
export default class extends Vue {
  // @Ref() readonly refDialogPiece!: PieceComptableVue;
  // @Ref() readonly PieceAddResultVue!: PieceAddResultVue;
  private searchIsValid = true;

  private isErrorPeriode = false;
  private periodeIsLoading = false;
  private periodes: PeriodeComptable[] = [];
  private periodeSelected: PeriodeComptable = new PeriodeComptable();
  private periodesRules: any = [(v: PeriodeComptable) => !!v.typePeriodeComptable || 'La période est obligatoire'];

  private isErrorJournaux = false;
  private journaux: Journal[] = [];
  private journauxIsLoading = false;
  private journalSelected: Journal = new Journal();
  private detailJournalSelected = '';
  private journalRules: any = [(v: Journal) => v.numero != 0 || 'Sélection de journal obligatoire'];

  private selectedPiece!: EntetePieceComptable;

  private headers = [
    { text: '', value: 'isEquilibre', width: 50 },
    { text: 'Numéro pièce', value: 'numeroPiece' },
    { text: 'Date pièce', value: 'datePiece' },
    { text: 'Libellé', value: 'libelle' },
    { text: 'Débit', value: 'montantDebit', align: 'end' },
    { text: 'Crédit', value: 'montantCredit', align: 'end' }
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
      const periodes = await OperationDiverseApi.getPeriodes();
      periodes.forEach((p) => this.periodes.push(p));
    } catch (err) {
      this.notifier('Erreur lors du chargement des périodes', 'red');
    } finally {
      this.periodeIsLoading = false;
    }
  }

  private async loadJournaux() {
    try {
      this.journauxIsLoading = true;
      const journaux = await OperationDiverseApi.getJournaux();
      journaux.forEach((j) => this.journaux.push(j));
    } catch (err) {
      this.notifier('Erreur lors du chargement des journaux', 'red');
    } finally {
      this.journauxIsLoading = false;
    }
  }

  private async openPieceComptable(entete: EntetePieceComptable) {
    // this.refDialogPiece
    //   .open(this.periodeSelected, this.journalSelected, entete.numeroPiece)
    //   .then((resp) => {
    //     if (resp) {
    //       Vue.set(
    //         this.piecesComptables,
    //         this.piecesComptables.findIndex((e) => e == entete),
    //         resp
    //       );
    //       this.notifier(`Pièce numéro <b>${resp.codePieceDisplay}</b> mise à jour.`, 'success');
    //     } else {
    //       this.piecesComptables.splice(this.piecesComptables.indexOf(entete), 1);
    //       this.notifier(`Pièce numéro <b>${entete.codePieceDisplay}</b> supprimer.`, 'error');
    //     }
    //   })
    //   .catch()
    //   .finally(() => {
    //     this.$nextTick(() => (this.$refs.btnAdd as any).$el.focus());
    //   });
  }

  private createNewPieceComptable() {
    // this.refDialogPiece
    //   .openNew(this.periodeSelected, this.journalSelected)
    //   .then((resp) => {
    //     this.displayAddResult(resp);
    //     this.journalSelected.numeroDernierePiece = parseInt(resp);
    //     this.loadPiecesComptables();
    //   })
    //   .finally(() => {
    //     this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
    //   });
  }

  private displayAddResult(numeroPiece: string) {
    // (this.$refs.PieceAddResultVue as PieceAddResultVue)
    //   .open(this.journalSelected.numero, parseInt(numeroPiece), this.periodeSelected.typePeriodeComptable)
    //   .then((numero) => {
    //     if (parseInt(numeroPiece) != numero) {
    //       this.loadPiecesComptables();
    //     }
    //   })
    //   .finally(() => {
    //     this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
    //   });
  }

  @Watch('options')
  @Watch('search')
  private async loadPiecesComptables() {
    try {
      if (this.periodeSelected.typePeriodeComptable && this.journalSelected.numero) {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        const pagination = new Pagination();
        pagination.terms = this.search;
        pagination.sortBy = sortBy;
        pagination.sortDesc = sortDesc.length ? sortDesc : false;
        pagination.page = page;
        pagination.limit = itemsPerPage;

        this.isLoadingPieces = true;
        const paginationResult = await OperationDiverseApi.getEntetePiecesComptables(
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