<template>
  <v-dialog
    v-model="dialog"
    scrollable
    width="2000"
    :persistent="!piecereadonly"
    @keydown.f2="ModifierPiece"
    @keydown.suppr="DeletePiece"
    eager
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
        <v-btn
          class="mr-10"
          color="error"
          v-if="piecereadonly"
          @click="DeletePiece"
        >
          <v-icon left>mdi-delete</v-icon>Supprimer
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
                  @keypress.enter="loadCompte"
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
                <DatePicker
                  label="Date pièce"
                  :dateSelected.sync="datePiece"
                  :readonly.sync="piecereadonly"
                ></DatePicker>
              </v-col>
              <v-col cols="4">
                <DatePicker
                  label="Date échéance"
                  :dateSelected.sync="dateEcheance"
                  :readonly.sync="piecereadonly"
                ></DatePicker>
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
                  tabindex="-1"
                ></v-checkbox>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant en devise comptable"
                  :value="pieceComptableData.libelleMontantCompta"
                  filled
                  readonly
                  tabindex="-1"
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
                  :value="pieceComptableData.libelleSoldeCompteTiers"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="Délai de paiement"
                  :value="pieceComptableData.delaiPaiementLibelle"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="% Escompte"
                  :value="pieceComptableData.compteTiersEscomptePourcentage"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  label="Nombre jours escompte"
                  :value="pieceComptableData.compteTiersEscompteNombreJours"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  label="Compte associé"
                  :value="pieceComptableData.libelleCompteAssocie"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="Compte achat/vente"
                  :value="pieceComptableData.libelleCompteVenteAchat"
                  filled
                  readonly
                  tabindex="-1"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="7">
            <GridContreparties
              :Contreparties.sync="contreparties"
              :IsReadOnly.sync="piecereadonly"
              :NumeroJournal.sync="numeroJournal"
              :DeviseEntete.sync="deviseSelected"
            ></GridContreparties>
            <SearchCompteTier ref="compteDialog"></SearchCompteTier>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider v-if="!piecereadonly"></v-divider>
      <v-card-actions v-if="!piecereadonly">
        <v-spacer></v-spacer>
        <v-btn class="mr-10" color="warning" @click="ModifierPiece">
          <v-icon left>mdi-content-save</v-icon>Sauvegarder
        </v-btn>
      </v-card-actions>
      <Confirm ref="confirmDialog"></Confirm>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import axios from "axios";
import moment from "moment";
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  PieceComptable,
  PieceComptableContrepartie,
  Devise,
  Statut,
  Journal
} from "@/models/AchatVente";
import CompteSearch from "@/models/Compte/CompteSearch";
import SearchCompteTier from "./SearchCompteTier.vue";
import Confirm from "@/components/Confirm.vue";
import DatePicker from "@/components/DatePicker.vue";
import { CompteApi } from "@/api/CompteApi";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import GridContreparties from "./GridContreparties.vue";

@Component({
  name: "AchatVentePiece",
  components: { SearchCompteTier, GridContreparties, Confirm, DatePicker }
})
export default class extends Vue {
  public piecereadonly: boolean = true;
  private pieceComptableData: PieceComptable = new PieceComptable();
  private contreparties: PieceComptableContrepartie[] = [];

  //Titre
  private periodeDisplay: string = "";
  private journalDisplay: string = "";
  private numeroPiece: string = "";
  private numeroJournal: number = 0;

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

  public typeCompte: string = "";
  private isEdit: boolean = false;

  private numeroCompteTier: string = "";
  private nomCompteTier: string = "";

  public dialog: boolean = false;
  public searchCompteTiersDialog: boolean = false;

  // public Init(
  //   entete: EntetePieceComptable,
  //   periode: PeriodeComptable,
  //   journal: Journal
  // ) {
  //   this.piecereadonly = true;
  //   this.SetPeriodeDisplay(periode);
  //   this.SetJournalDisplay(journal);
  //   this.numeroPiece = entete.codePiece.toString();
  //   this.numeroJournal = entete.codeJournal;

  //   this.GetData();
  // }

  private resolve!: any;
  private reject!: any;

  public open(entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal): Promise<EntetePieceComptable> {
    this.dialog = true;
    this.piecereadonly = true;
    this.SetPeriodeDisplay(periode);
    this.SetJournalDisplay(journal);
    this.numeroPiece = entete.codePiece.toString();
    this.numeroJournal = entete.codeJournal;

    this.GetData();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private GetData() {
    AchatVenteApi.getPieceComptable(this.numeroJournal, this.numeroPiece)
      .then(pieceComptable => {
        this.SetDisplayData(pieceComptable);
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
  }

  private compteLoading: boolean = false;
  private loadCompte() {
    this.compteLoading = true;
    CompteApi.getCompteTier(this.typeCompte, this.numeroCompte.toString())
      .then(compte => {
        this.setCompte(compte);
      })
      .finally(() => {
        this.compteLoading = false;
      });
  }
  private OpenSearchCompte(): void {
    (this.$refs.compteDialog as SearchCompteTier)
      .open(this.typeCompte)
      .then(compte => {
        this.setCompte(compte);
      });
  }
  private setCompte(compte: CompteSearch) {
    this.numeroCompte = compte.numero;
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

  @Watch("datePiece")
  private datePieceChanged(val: Date, oldVal: Date) {
    if (!this.piecereadonly && val != oldVal) {
      AchatVenteApi.getDateEcheance(
        this.typeCompte,
        this.numeroCompte,
        val
      ).then(dateEcheance => {
        this.dateEcheance = dateEcheance;
      });
    }
  }

  @Emit("saveAction")
  private save() {}
}
</script>

<style>
.textMini {
  font-size: 12px;
}
</style>
