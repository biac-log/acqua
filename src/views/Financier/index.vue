<template>
  <v-container fluid @keydown.plus.prevent="create">
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
              @change="PeriodeChanged"
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
                `Nature ${journalSelected.famille} - Devise ${journalSelected.devise} - Dernière pièce ${journalSelected.numeroDernierePiece}`
              "
              return-object
              persistent-hint
              @focus="LoadJournaux"
              :rules="journalRules"
              required
            >
            </v-select>
          </v-col>
          <v-col cols="12" xs="12" md="3" lg="3">
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
          </v-col>
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
        sort-by="codePieceDisplay"
        sort-desc
      >
        <template v-slot:item.datePieceDate="{ item }">
          <span>{{ item.datePieceDate.toString() }}</span>
        </template>
        <template v-slot:item.soldeInitiale="{ item }">
          <span>{{ item.soldeInitiale | numberToString }}</span>
        </template>
        <template v-slot:item.totalDebit="{ item }">
          <span>{{ item.totalDebit | numberToString }}</span>
        </template>
        <template v-slot:item.totalCredit="{ item }">
          <span>{{ item.totalCredit | numberToString }}</span>
        </template>
        <template v-slot:item.soldeFinale="{ item }">
          <span>{{ item.soldeFinale | numberToString }}</span>
        </template>
        <template v-slot:item.pieceEquilibree="{ item }">
          <v-simple-checkbox v-model="item.pieceEquilibree" disabled></v-simple-checkbox>
       </template>
      </v-data-table>
    </v-card>
    <AchatVentePieceVue ref="refDialogPiece"></AchatVentePieceVue>
    <!-- <PieceAddResultVue ref="PieceAddResultVue"></PieceAddResultVue> -->
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">{{ snackbarColor == "error" ? "mdi-delete" : "mdi-check" }}</v-icon>
      <span v-html="snackbarMessage"></span>
      <v-btn icon dark @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import moment from "moment";
import { FinancierApi } from "../../api/FinancierApi";
import { displayAxiosError } from '@/utils/ErrorMethods';
import {
  PeriodeComptable,
  Journal,
  EntetePieceComptable
} from "@/models/Financier";

@Component({
  name: "Financier",
  //components: { AchatVentePieceVue, PieceAddResultVue }
})
export default class extends Vue {
  private searchIsValid: boolean = true;

  private isErrorPeriode: boolean = false;
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
    { text: "Libelle", value: "libelle" },
    { text: "Solde initiale", value: "soldeInitiale", align: "end" },
    { text: "Débit", value: "totalDebit", align: "end" },
    { text: "Crédit", value: "totalCredit", align: "end" },
    { text: "Solde finale", value: "soldeFinale", align: "end" },
    { text: "Equilibré", value: "pieceEquilibree"},
  ];
  private search: string = "";
  private piecesComptables: EntetePieceComptable[] = [];
  private isLoadingPieces: boolean = false;

  mounted(){
    this.LoadPeriodes();
    this.LoadJournaux();
  }

  private async LoadPeriodes() {
    try{
      this.periodeIsLoading = true;
      let periodes = await FinancierApi.getPeriodes();
      periodes.forEach(p => this.periodes.push(p));
    }catch(err){
      this.isErrorPeriode = true;
    }finally {
      this.periodeIsLoading = false;
    }
  }

  private async LoadJournaux() {
    try{
      this.journauxIsLoading = true;
      let journaux = await FinancierApi.getJournaux();
      journaux.forEach(j => this.journaux.push(j));
    }catch(err){
      this.isErrorJournaux = true;
    }finally {
      this.journauxIsLoading = false;
    }
  }

  private async LoadPiecesComptables() {
    try {
      this.isLoadingPieces = true;
      this.piecesComptables = await FinancierApi.getEntetePiecesComptables(this.journalSelected.numero, this.periodeSelected.typePeriodeComptable);
    } catch (err) {
      this.notifier(displayAxiosError(err), "red");
    }finally{
      this.isLoadingPieces = false;
    }
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
