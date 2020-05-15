<template>
  <v-container fluid @keydown.plus.prevent="openNewPieceComptable">
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
              v-model="periodeSelected"
              :items="periodes"
              :loading="periodeIsLoading"
              :hint="periodeSelected.libellePeriode"
              :rules="periodesRules"
              @change="LoadPiecesComptables"
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
              :hint="
                `Devise ${journalSelected.devise} - Dernière pièce ${journalSelected.numeroDernierePiece}`
              "              
              return-object
              persistent-hint
              @change="LoadPiecesComptables"
              :rules="journalRules"
              required
            >
            </v-select>
          </v-col>
          <!-- <v-col cols="12" xs="12" md="3" lg="3">
            <v-btn
              color="primary"
              id="btn-acqua"
              x-large
              :disabled="!searchIsValid"
              @click="LoadPiecesComptables"
            >
              <v-icon>mdi-magnify</v-icon>
              Charger
            </v-btn>
          </v-col> -->
        </v-row>
      </v-form>
    </v-card>
    <v-card class="mt-5">
      <v-card-title>
        Pièces comptables
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" :disabled="!searchIsValid" @click="openNewPieceComptable">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
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
        @click:row="OpenPieceComptable"
        :options.sync="options"
        :server-items-length="totalItems"
      >
        <template v-slot:item.datePieceDate="{ item }">
          <span>{{ item.datePieceDate.toString() }}</span>
        </template>
        <template v-slot:item.dateEcheanceDate="{ item }">
          <span>{{ item.dateEcheanceDate.toString() }}</span>
        </template>
        <template v-slot:item.montant="{ item }">
          <span>{{ item.montant | numberToString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <AchatVentePieceVue ref="refDialogPiece"></AchatVentePieceVue>
    <PieceAddResultVue ref="PieceAddResultVue"></PieceAddResultVue>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">{{ snackbarColor == "error" ? "mdi-delete" : "mdi-check" }}</v-icon>
      <span v-html="snackbarMessage"></span>
      <v-btn icon dark @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import {
  PeriodeComptable,
  EntetePieceComptable,
  Journal
} from "@/models/AchatVente";
import { JournalApi } from "@/api/JournalApi";
import moment from "moment";
import AchatVentePieceVue from "./components/AchatVentePiece.vue";
import PieceAddResultVue from "./components/PieceAddResult.vue";
import { AchatVenteApi } from "../../api/AchatVenteApi";
import { Pagination } from '@/models/Pagination';

@Component({
  name: "AchatVente",
  components: { AchatVentePieceVue, PieceAddResultVue }
})
export default class extends Vue {
  private searchIsValid: boolean = true;
  private isErrorPeriode: boolean = false;
  private libellePeriode: string = "";
  
  private periodeIsLoading: boolean = false;
  private periodes: PeriodeComptable[] = [];
  private periodeSelected: PeriodeComptable = new PeriodeComptable();
  private periodesRules: any = [
    (v: string) => !this.isErrorPeriode || "Connexion impossible",
    (v: string) => !!v || "La période est obligatoire"
  ];

  private isErrorJournaux: boolean = false;
  private journaux: Journal[] = [];
  private journauxIsLoading: boolean = false;
  private journalSelected: Journal = new Journal();
  private detailJournalSelected: string = "";
  private journalRules: any = [
    (v: Journal) => !this.isErrorJournaux || "Connexion impossible",
    (v: Journal) => !!v || "Sélection de journal obligatoire",
    (v: Journal) => v.numero != 0 || "Sélection de journal obligatoire"
  ];

  private selectedPiece!: EntetePieceComptable;

  private headers = [
    { text: "Numéro pièce", value: "codePieceDisplay" },
    { text: "Date pièce", value: "datePieceDate" },
    { text: "Date échéance", value: "dateEcheanceDate" },
    { text: "Numéro compte", value: "numeroCompte" },
    { text: "Nom compte", value: "nomCompte" },
    { text: "Libelle", value: "libelle" },
    { text: "Montant", value: "montant", align: "end" },
    { text: "Escompte", value: "escompte", align: "end" },
    { text: "Devise", value: "devise" },
    { text: "Status", value: "statusLibelle" }
  ];
  private search: string = "";
  private piecesComptables: EntetePieceComptable[] = [];
  private isLoadingPieces: boolean = false;
  private options: any = {};
  private totalItems: number = 0;

  mounted() {
    this.LoadPeriodes();
    this.LoadJournaux();
  }

  private async LoadPeriodes() {
    try {
      this.periodeIsLoading = true;
      let periodes = await AchatVenteApi.getPeriodes();
      console.log(periodes);
      periodes.forEach(p => this.periodes.push(p));
    } catch (err) {
      this.isErrorPeriode = true;
    } finally {
      this.periodeIsLoading = false;
    }
  }

  private async LoadJournaux() {
    try {
      this.journauxIsLoading = true;
      let journaux = await AchatVenteApi.getJournaux();
      journaux.forEach(j => this.journaux.push(j));
    } catch (err) {
      this.isErrorJournaux = true;
    } finally {
      this.journauxIsLoading = false;
    }
  }

  @Watch("options")
  onOptionsChanged() {
    this.LoadPiecesComptables();
  }
  private async LoadPiecesComptables() {
    try {
      if(this.periodeSelected && this.journalSelected.numero){
        this.isLoadingPieces = true;
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;

        let pagination = new Pagination();
        pagination.terms = this.search;
        pagination.sortBy = sortBy;
        pagination.sortDesc = sortDesc;
        pagination.page = page;
        pagination.limit = itemsPerPage;

        let paginationResult = await AchatVenteApi.GetEntetePiecesComptables(this.journalSelected.numero, this.periodeSelected.typePeriodeComptable, pagination);
        this.piecesComptables = paginationResult.items.map(i => new EntetePieceComptable(i));
        this.totalItems = paginationResult.totalCount;
      }
    }catch (err) {
      
    }finally{
      this.isLoadingPieces = false;
    }
  }

  private OpenPieceComptable(entete: EntetePieceComptable) {
    (this.$refs.refDialogPiece as AchatVentePieceVue)
      .open(entete, this.periodeSelected, this.journalSelected)
      .then(resp => {
        if(resp.action == "UPDATE"){
          Vue.set(this.piecesComptables, this.piecesComptables.findIndex(e => e == entete), resp.data);
          this.notifier(`Pièce numéro <b>${resp.data.codePieceDisplay}</b> mise à jour.`, "success");
        }else if(resp.action == "DELETE"){
          this.piecesComptables.splice(this.piecesComptables.indexOf(entete), 1);
          this.notifier(`Pièce numéro <b>${resp.data.codePieceDisplay}</b> supprimer.`, "error");
        }
      })
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any).$el.focus());
      });
  }

  private openNewPieceComptable() {
    (this.$refs.refDialogPiece as AchatVentePieceVue)
      .openNew(this.periodeSelected, this.journalSelected)
      .then((resp) => {
        this.displayAddResult(resp.data);
        this.piecesComptables.unshift(resp.data);
      })
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private displayAddResult(piece : EntetePieceComptable){
    (this.$refs.PieceAddResultVue as PieceAddResultVue).open(piece.codeJournal, piece.codePiece, this.periodeSelected.typePeriodeComptable).then((numero) => {
      if(piece.codePiece != numero){
        piece.codePiece = numero;
        Vue.set(this.piecesComptables, this.piecesComptables.findIndex(e => e == piece), piece);
      }
    }).finally(() => {
      this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
    });
  }

  private snackbar: boolean = false;
  private snackbarTimeout: number = 5000;
  private snackbarMessage: string = "";
  private snackbarColor: string = "";

  private notifier(message: string, color:string){
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
