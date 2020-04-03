<template>
  <v-dialog
    v-model="dialog"
    scrollable
    width="2000"
    :persistent="!piecereadonly"
    @keydown.f2="ModifierPiece"
    @keydown.delete="DeletePiece"
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title class="d-flex justify-start">
          <p class="mb-0">Pièce {{ numeroJournal }}.{{ numeroPiece }}</p>
          <p class="ml-10 mb-0 textMini">Période {{ periodeDisplay }}</p>
          <p class="ml-5 mb-0 textMini">Journal {{ journalDisplay }}</p>
        </v-card-title>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-5"
          color="success"
          @click="ModifierPiece"
          v-if="piecereadonly"
        >
          <v-icon left>mdi-pencil</v-icon>Modifier
        </v-btn>
        <v-btn class="mr-10" color="error" v-if="piecereadonly" @click="DeletePiece">
          <v-icon left>mdi-delete</v-icon>Supprimer
        </v-btn>
        <v-btn
          class="mr-10"
          color="warning"
          @click="ModifierPiece"
          v-if="!piecereadonly"
        >
          <v-icon left>mdi-content-save</v-icon>Sauvegarder
        </v-btn>
        <v-btn
          ref="buttonClose"
          class="ml-10"
          icon
          color="white"
          @click="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row fill-height>
          <v-col cols="5">
            <v-row dense>
              <v-col cols="4">
                <v-text-field
                  label="Numéro compte tiers"
                  v-model="numeroCompte"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  :append-icon="piecereadonly ? '' : 'mdi-magnify'"
                  hide-details
                  ref="firstElement"
                  @click:append="OpenSearchCompte()"
                  @focus="$event.target.select()"
                >
                </v-text-field>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  label="Nom compte tiers"
                  :value="pieceComptableData.compteTiersNom"
                  :filled="piecereadonly"
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  label="Libelle"
                  :value="pieceComptableData.libelle"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                  v-model="libelle"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="2">
                <v-select
                  :items="devises"
                  v-model="deviseSelected"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  item-value="id"
                  item-text="libelle"
                  label="Devise pièce"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant"
                  v-model="montant"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant Escompte"
                  v-model="montantEscompte"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="2">
                <v-text-field
                  label="Taux"
                  :value="pieceComptableData.taux"
                  :filled="piecereadonly"
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-menu
                  ref="menuDatePiece"
                  v-model="menuDatePiece"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{}">
                    <v-text-field
                      v-model="datePieceFormat"
                      label="Date pièce"
                      :prepend-icon="piecereadonly ? '' : 'mdi-calendar'"
                      @click:prepend="menuDatePiece = true"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      @blur="datePiece = parseDate(datePieceFormat)"
                      hide-details
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="datePiece"
                    no-title
                    @input="menuDatePiece = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  ref="menuDateEcheance"
                  v-model="menuDateEcheance"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{}">
                    <v-text-field
                      v-model="dateEcheanceFormat"
                      label="Date échéance"
                      :prepend-icon="piecereadonly ? '' : 'mdi-calendar'"
                      @click:prepend="menuDateEcheance = true"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      @blur="dateEcheance = parseDate(dateEcheanceFormat)"
                      hide-details
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dateEcheance"
                    no-title
                    @input="menuDateEcheance = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-select
                  :items="statuts"
                  v-model="statutSelected"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  item-value="id"
                  item-text="libelle"
                  label="Statut"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-checkbox
                  label="Pièce acquitée"
                  :value="pieceComptableData.pieceAcquittee"
                  readonly
                ></v-checkbox>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant en devise comptable"
                  :value="montantCompta"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-card-title>Informations compte tiers</v-card-title>
            <v-row dense>
              <v-col cols="3">
                <v-text-field
                  label="Solde du compte"
                  :value="soldeCompteTiers"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="Délai de paiement"
                  :value="pieceComptableData.delaiPaiementLibelle"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="% Escompte"
                  :value="pieceComptableData.compteTiersEscomptePourcentage"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="Nombre jours escompte"
                  :value="pieceComptableData.compteTiersEscompteNombreJours"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  label="Compte associé"
                  :value="compteAssocie"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="Compte achat/vente"
                  :value="compteVenteAchat"
                  filled
                  readonly
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="7">
            <v-card>
              <v-card-title>Contreparties</v-card-title>
              <v-data-table
                :headers="headersContreparties"
                :items="contreparties"
                :items-per-page="10"
                class="elevation-1"
                dense
              >
                <template v-slot:item.numeroCase="{ item }">
                  <span>{{ item.numeroCase }} - {{ item.libelleCase }}</span>
                </template>
              </v-data-table>
            </v-card>
            <SearchCompteTier
              ref="compteDialog"
              :dialog.sync="searchCompteTiersDialog"
              @compteSelected="setCompte"
            ></SearchCompteTier>
          </v-col>
        </v-row>
      </v-card-text>
      <Confirm ref="confirmDialog"></Confirm>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  PieceComptable,
  PieceComptableContrepartie,
  Devise,
  Statut
} from "@/models/AchatVenteModels";
import Journal from "@/models/Journal";
import axios from "axios";
import moment from "moment";
import SearchCompteTier from "./SearchCompteTier.vue";
import { ICompteSearch } from "../../../models/Compte";
import Confirm from "@/components/Confirm.vue";

@Component({
  name: "AchatVentePiece",
  components: { SearchCompteTier, Confirm }
})
export default class extends Vue {
  public piecereadonly: boolean = true;
  private pieceComptableData: PieceComptable = new PieceComptable();
  private contreparties: PieceComptableContrepartie[] = [];

  //Titre
  private periodeDisplay: string = "";
  private journalDisplay: string = "";
  private numeroPiece: string = "";
  private numeroJournal: string = "";

  //Encodage
  private numeroCompte: number = 0;
  private libelle: string = "";
  private montant: number = 0;
  private montantEscompte: number = 0;
  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();
  private statuts: Statut[] = [];
  private statutSelected: Statut = new Statut();
  private datePiece: Date = new Date();
  private dateEcheance: Date = new Date();

  //Display
  private menuDatePiece: boolean = false;
  private menuDateEcheance: boolean = false;
  private datePieceFormat: string = "";

  private dateEcheanceFormat: string = "";
  public typeCompte: string = "";
  private statut: string = "";
  private montantCompta: string = "";

  private compteAssocie: string = "";
  private compteVenteAchat: string = "";
  private soldeCompteTiers: string = "";
  private isEdit: boolean = false;

  private numeroCompteTier: string = "";
  private nomCompteTier: string = "";

  private headersContreparties = [
    { text: "N° Compte", value: "compteDisplay" },
    { text: "Nom compte", value: "compteLibelle" },
    { text: "Libelle", value: "libelle" },
    { text: "Débit", value: "montantDebit", align: "end" },
    { text: "Crédit", value: "montantCredit", align: "end" },
    { text: "Devise", value: "libelleDevise" },
    { text: "Case TVA", value: "numeroCase" }
  ];

  @PropSync("dialogPiece")
  public dialog!: boolean;
  public searchCompteTiersDialog: boolean = false;

  public Init(
    entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal
  ) {
    this.piecereadonly = true;
    this.SetPeriodeDisplay(periode);
    this.SetJournalDisplay(journal);
    this.numeroPiece = entete.codePiece.toString();
    this.numeroJournal = entete.codeJournal.toString();

    this.GetData();
  }

  private GetData() {
    axios
      .get<PieceComptable>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetPieceComptable?journal=" +
          this.numeroJournal +
          "&piece=" +
          this.numeroPiece
      )
      .then(resp => {
        this.SetDisplayData(resp.data);
      })
      .catch(error => {})
      .finally(() => {});
  }

  private SetPeriodeDisplay(periode: PeriodeComptable) {
    let stPeriode = "Courante";
    if (periode.typePeriodeComptable == "precedente") stPeriode = "Précédente";
    this.periodeDisplay = `${stPeriode} du ${moment(periode.debut).format(
      "DD/MM/YYYY"
    )} au ${moment(periode.fin).format("DD/MM/YYYY")}`;
  }

  private SetJournalDisplay(journal: Journal) {
    this.journalDisplay = `${journal.numero} -  ${journal.libelle}`;
    if (journal.famille == "vente" || journal.famille == "ncvente")
      this.typeCompte = "C";
    else if (journal.famille == "achat" || journal.famille == "ncachat")
      this.typeCompte = "F";
  }

  private SetDisplayData(pieceComptable: PieceComptable) {
    this.pieceComptableData = pieceComptable;
    this.contreparties = this.pieceComptableData.contreparties;

    this.DisplayEnteteData();
    this.DisplayCompteTiersData();
    this.DisplayContreparties();
  }

  private DisplayEnteteData() {
    this.numeroCompte = this.pieceComptableData.compteTiersNumero;
    this.libelle = this.pieceComptableData.libelle;
    this.datePiece = this.pieceComptableData.datePiece;
    this.dateEcheance = this.pieceComptableData.dateEcheance;

    this.montant = this.pieceComptableData.montantDevise;
    this.montantEscompte = this.pieceComptableData.montantEscompteDevise;
    this.deviseSelected = {
      id: this.pieceComptableData.codeDevise,
      libelle: this.pieceComptableData.deviseComptaLibelle
    };
    this.devises.push(this.deviseSelected);

    this.statutSelected = {
      id: this.pieceComptableData.statut,
      libelle: this.pieceComptableData.statutLibelle
    };
    this.statuts.push(this.statutSelected);

    this.statut =
      this.pieceComptableData.statut +
      " - " +
      this.pieceComptableData.statutLibelle;

    this.montantCompta =
      this.pieceComptableData.montantBase.toFixed(2) +
      " " +
      this.pieceComptableData.deviseComptaLibelle;
  }

  private DisplayCompteTiersData() {
    this.compteAssocie =
      this.pieceComptableData.compteAssocieNumero +
      " " +
      this.pieceComptableData.compteAssocieNom;

    this.compteVenteAchat =
      this.pieceComptableData.compteVenteAchatNumero +
      " " +
      this.pieceComptableData.compteVenteAchatNom;

    this.soldeCompteTiers =
      this.pieceComptableData.compteTiersSoldeComptable.toFixed(2) +
      " " +
      this.pieceComptableData.compteTiersLibelleDevise;
  }

  private DisplayContreparties() {
    this.contreparties.forEach(element => {
      if (element.codeMouvement == "DB")
        element.montantDebit = element.montantDevise.toFixed(2);
      else element.montantCredit = element.montantDevise.toFixed(2);

      element.compteDisplay = element.typeCompte + element.numeroCompte;
    });
  }

  private loadCompte() {
    axios.get<ICompteSearch>(
      `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetCompteById?typeCompte=${this.typeCompte}&numeroCompte=${this.numeroCompteTier}`
    );
  }

  private setCompte(compte: ICompteSearch) {
    this.pieceComptableData.compteTiersNumero = compte.numero;
    this.pieceComptableData.compteTiersNom = compte.nom;
  }

  private ModifierPiece() {
    this.piecereadonly = false;
    this.$nextTick(() => (this.$refs.firstElement as any).focus());
    this.LoadStatuts();
    this.LoadDevises();
  }

  private DeletePiece() {
    (this.$refs.confirmDialog as Confirm)
      .open(
        "Suppression",
        `Êtes-vous sur de vouloir supprimer la piece ${this.numeroJournal}.${this.numeroPiece} ?`,
        "error",
        "Supprimer"
      )
      .then(resp => {
        if (resp) console.log("DELETE");
      });
  }

  private LoadStatuts() {
    axios
      .get<Statut[]>(
        process.env.VUE_APP_ApiAcQuaCore + "/AchatVente/GetStatuts"
      )
      .then(resp => {
        this.statuts = resp.data;
      })
      .catch(error => {})
      .finally(() => {});
  }

  private LoadDevises() {
    axios
      .get<Devise[]>(
        process.env.VUE_APP_ApiAcQuaCore + "/AchatVente/GetDevises"
      )
      .then(resp => {
        this.devises = resp.data;
      })
      .catch(error => {})
      .finally(() => {});
  }

  private parseDate(date: string) {
    if (!date) return null;

    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  @Watch("datePiece")
  private datePieceChanged(val: Date, oldVal: Date) {
    this.datePieceFormat = moment(val).format("DD/MM/YYYY");
  }

  @Watch("dateEcheance")
  private dateEcheanceChanged(val: Date, oldVal: Date) {
    this.dateEcheanceFormat = moment(val).format("DD/MM/YYYY");
  }
  private OpenSearchCompte(): void {
    this.searchCompteTiersDialog = true;
    (this.$refs.compteDialog as SearchCompteTier).loadComptes(this.typeCompte);
  }

  private searchCompteTiers() {}

  @Emit("saveAction")
  private save() {}
}
</script>

<style>
.textMini {
  font-size: 12px;
}
</style>
