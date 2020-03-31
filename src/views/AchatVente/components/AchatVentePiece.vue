<template>
  <v-dialog v-model="dialog" scrollable width="2000" :persistent="!piecereadonly">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title class="d-flex justify-start">
          <p class="mb-0">Pièce {{numeroJournal}}.{{numeroPiece}}</p>
          <p class="ml-10 mb-0 textMini">Période {{periodeDisplay}}</p>
          <p class="ml-5 mb-0 textMini">Journal {{journalDisplay}}</p>
        </v-card-title>
        <v-spacer></v-spacer>
        <v-btn class="mr-5" color="success" @click="ModifierPiece" v-if="piecereadonly">
          <v-icon left>mdi-pencil</v-icon>Modifier
        </v-btn>
        <v-btn class="mr-10" color="error" v-if="piecereadonly">
          <v-icon left>mdi-delete</v-icon>Supprimer
        </v-btn>
        <v-btn class="mr-10" color="warning" @click="ModifierPiece" v-if="!piecereadonly">
          <v-icon left>mdi-content-save</v-icon>Sauvegarder
        </v-btn>
        <v-btn class="ml-10" icon color="white" @click="dialog = false">
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
                  :value="pieceComptableData.compteTiersNumero"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  :append-icon="piecereadonly ? '' : 'mdi-magnify'"
                  @click:append="searchCompteTiers"
                  hide-details
                ></v-text-field>
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
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="2">
                <v-text-field
                  label="Devise pièce"
                  :value="pieceComptableData.libelleDevise"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant"
                  :value="pieceComptableData.montantDevise"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Montant Escompte"
                  :value="pieceComptableData.montantEscompteDevise"
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
                <v-text-field
                  label="Date pièce"
                  v-model="datePiece"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Date échéance"
                  :value="dateEcheance"
                  :filled="piecereadonly"
                  :readonly="piecereadonly"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field label="Statut" :value="statut" :filled="piecereadonly"
                  :readonly="piecereadonly" hide-details></v-text-field>
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
                  <span>{{ item.numeroCase }} - {{item.libelleCase}}</span>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  Journal,
  PieceComptable,
  PieceComptableContrepartie
} from "@/models/AchatVenteModels";
import axios from "axios";
import moment from "moment";

@Component({
  name: "AchatVentePiece"
})
export default class extends Vue {
  public pieceComptableData: PieceComptable = new PieceComptable();
  private contreparties: PieceComptableContrepartie[] = [];
  public periodeDisplay: string = "";
  public journalDisplay: string = "";
  public numeroPiece: string = "";
  public numeroJournal: string = "";
  private datePiece: string = moment(this.pieceComptableData.datePiece).format(
    "DD/MM/YYYY"
  );
  private dateEcheance: string = moment(
    this.pieceComptableData.dateEcheance
  ).format("DD/MM/YYYY");
  private statut: string = "";
  private montantCompta: string = "";

  private compteAssocie: string = "";
  private compteVenteAchat: string = "";
  private soldeCompteTiers: string = "";

  private headersContreparties = [
    { text: "N° Compte", value: "compteDisplay" },
    { text: "Nom compte", value: "compteLibelle" },
    { text: "Libelle", value: "libelle" },
    { text: "Débit", value: "montantDebit", align: "end" },
    { text: "Crédit", value: "montantCredit", align: "end" },
    { text: "Devise", value: "libelleDevise" },
    { text: "Case TVA", value: "numeroCase" }
  ];

  public piecereadonly:boolean=true;

  @PropSync("dialogPiece")
  public dialog!: boolean;

  public Init(
    entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal
  ) {
    this.piecereadonly=true;
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
        this.pieceComptableData = resp.data;

        this.SetDisplayData();
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
  }

  private SetDisplayData() {
    this.datePiece = moment(this.pieceComptableData.datePiece).format(
      "DD/MM/YYYY"
    );
    this.dateEcheance = moment(this.pieceComptableData.dateEcheance).format(
      "DD/MM/YYYY"
    );
    this.contreparties = this.pieceComptableData.contreparties;
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
    this.statut =
      this.pieceComptableData.statut +
      " - " +
      this.pieceComptableData.statutLibelle;
    this.montantCompta =
      this.pieceComptableData.montantBase.toFixed(2) +
      " " +
      this.pieceComptableData.deviseComptaLibelle;

    this.contreparties.forEach(element => {
      if (element.codeMouvement == "DB")
        element.montantDebit = element.montantDevise.toFixed(2);
      else element.montantCredit = element.montantDevise.toFixed(2);

      element.compteDisplay = element.typeCompte + element.numeroCompte;
    });
  }

  private ModifierPiece() {
   this.piecereadonly = false;
   this.isEdit = true; 
  }

  private searchCompteTiers(){}

  @Emit("saveAction")
  private save() {}
}
</script>

<style>
.textMini {
  font-size: 12px;
}
</style>