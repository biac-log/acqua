<template>
  <v-container fluid>
    <v-card>
      <v-form ref="form" v-model="searchIsValid">
        <v-row align="start" justify="start" class="pl-5 pr-5">
          <v-col cols="12" xs="12" md="4" lg="2">
            <v-select
              v-model="periodeSelected"
              :items="periodes"
              label="Sélection de la période"
              outlined
              :loading="periodeIsLoading"
              @change="LoadPeriode"
              :hint="libellePeriode"
              persistent-hint
              :rules="periodesRules"
              required
              autofocus
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
        <v-btn color="warning" fab dark class="ml-5">
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
        :headers="headers"
        :items="piecesComptables"
        :search="search"
        :loading="isLoadingPieces"
        @click:row="OpenPieceComptable"
        sort-by="codePieceDisplay"
        sort-desc
      >
        <template v-slot:item.datePiece="{ item }">
          <span>{{ item.datePiece | dateToString }}</span>
        </template>
        <template v-slot:item.dateEcheance="{ item }">
          <span>{{ item.dateEcheance | dateToString }}</span>
        </template>
        <template v-slot:item.montant="{ item }">
          <span>{{ item.montant | numberToString }}</span>
        </template>
      </v-data-table>
    </v-card>
    <AchatVentePieceVue
      ref="refPiece"
      :dialogPiece.sync="dialogPieceMaster"
      @saveAction="updateRow()"
    ></AchatVentePieceVue>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import {
  PeriodeComptable,
  EntetePieceComptable,
  Journal
} from "@/models/AchatVente";
import { JournalApi } from "@/api/JournalApi";
import moment from "moment";
import AchatVentePieceVue from "./components/AchatVentePiece.vue";

@Component({
  name: "AchatVente",
  components: { AchatVentePieceVue }
})
export default class extends Vue {
  private searchIsValid: boolean = true;
  private isErrorPeriode: boolean = false;
  private periodeIsLoading: boolean = false;
  private libellePeriode: string = "";
  private periodes: string[] = ["Période courante", "Période précédente"];
  private periodeSelected: string = "";
  private periodesRules: any = [
    (v: string) => !this.isErrorPeriode || "Connexion impossible",
    (v: string) => !!v || "La période est obligatoire"
  ];

  private journaux: Journal[] = [];
  private journauxIsLoading: boolean = false;
  private journalSelected: Journal = new Journal();
  private detailJournalSelected: string = "";
  private journalRules: any = [
    (v: Journal) => !!v || "Sélection de journal obligatoire",
    (v: Journal) => v.numero != 0 || "Sélection de journal obligatoire"
  ];

  private periodeData: PeriodeComptable = new PeriodeComptable();
  private periodeSearched: PeriodeComptable = new PeriodeComptable();
  private journalSearched: Journal = new Journal();

  private headers = [
    { text: "Numéro pièce", value: "codePieceDisplay" },
    { text: "Date pièce", value: "datePiece" },
    { text: "Date échéance", value: "dateEcheance" },
    { text: "Numéro compte", value: "numeroCompte" },
    { text: "Nom compte", value: "nomCompte" },
    { text: "Libelle", value: "libelle" },
    { text: "Montant", value: "montant", align: "end" },
    { text: "Escompte", value: "escompte", align: "end" },
    { text: "Devise", value: "devise" },
    { text: "Status", value: "statutDisplay" }
  ];
  private search: string = "";
  private piecesComptables: EntetePieceComptable[] = [];
  private isLoadingPieces: boolean = false;

  private dialogPieceMaster: boolean = false;

  public LoadPeriode() {
    this.periodeIsLoading = true;

    axios
      .get<PeriodeComptable>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetPeriode" +
          this.GetPeriode()
      )
      .then(resp => {
        this.periodeData = resp.data;
        this.libellePeriode =
          "Début " +
          moment(resp.data.debut).format("DD/MM/YYYY") +
          " - Fin " +
          moment(resp.data.fin).format("DD/MM/YYYY");
      })
      .catch(error => {
        this.isErrorPeriode = true;
      })
      .finally(() => {
        this.periodeIsLoading = false;
      });
  }

  private GetPeriode(): string {
    let periode: string = "Courante";
    if (this.periodeSelected == "Période précédente") periode = "Precedente";

    return periode;
  }

  public LoadJournaux() {
    this.journauxIsLoading = true;
    JournalApi.getAll()
      .then(resp => {
        this.journaux = resp;
      })
      .catch(error => {})
      .finally(() => {
        this.journauxIsLoading = false;
      });
  }

  public LoadPiecesComptables() {
    this.isLoadingPieces = true;
    let periode: string = "courante";
    if (this.periodeSelected == "Période précédente") periode = "precedente";

    this.periodeSearched = this.periodeData;
    this.journalSearched = this.journalSelected;

    axios
      .get<EntetePieceComptable[]>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetEntetePiecesComptables?journal=" +
          this.journalSelected.numero +
          "&stPeriode=" +
          periode
      )
      .then(resp => {
        this.piecesComptables = resp.data;
        this.piecesComptables.forEach(element => {
          element.codePieceDisplay =
            element.codeJournal + "." + element.codePiece;
          element.statutDisplay =
            element.status + " - " + element.statusLibelle;
        });
      })
      .catch(error => {})
      .finally(() => {
        this.isLoadingPieces = false;
      });
  }

  public OpenPieceComptable(entete: EntetePieceComptable) {
    this.dialogPieceMaster = true;

    (this.$refs.refPiece as AchatVentePieceVue).Init(
      entete,
      this.periodeSearched,
      this.journalSearched
    );
  }

  public UpdateRow() {}
}
</script>

<style>
#btn-acqua {
  height: 56px;
}
</style>
