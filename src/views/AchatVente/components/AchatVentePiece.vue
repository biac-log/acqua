<template>
  <v-dialog v-model="dialog" scrollable width="2000">
    <v-card>
      <v-card-title class="d-flex justify-start">
        <v-row>
          <v-col cols="3">
            <v-text-field
              label="Période"
              v-model="periodeDisplay"
              outlined
              dense
              readonly
              filled
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              label="Journal"
              :value="journalDisplay"
              outlined
              dense
              filled
              readonly
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-text-field
              label="Numéro pièce"
              :value="numeroPiece"
              outlined
              dense
              filled
              readonly
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-text-field
            label="Numéro compte tiers"
            :value="pieceComptableData.compteTiersNumero"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Nom compte tiers"
            :value="pieceComptableData.compteTiersNom"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Libelle"
            :value="pieceComptableData.libelle"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            label="Montant"
            :value="pieceComptableData.montantDevise"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Devise pièce"
            :value="pieceComptableData.libelleDevise"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Taux"
            :value="pieceComptableData.taux"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            label="Date pièce"
            v-model="pieceComptableData.datePiece"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Date échéance"
            :value="pieceComptableData.dateEcheance"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-text-field
            label="Montant Escompte"
            :value="pieceComptableData.montantEscompteDevise"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
          <v-checkbox label="Pièce acquitée" :value="pieceComptableData.pieceAcquittee"></v-checkbox>
          <v-text-field
            label="Statut"
            :value="pieceComptableData.dateEcheance"
            dense
            filled
            readonly
            hide-details
            class="ma-2"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-data-table
            :headers="headersContreparties"
            :items="contreparties"
            :items-per-page="10"
            class="elevation-1"
          >
		  <template v-slot:item.montantDevise="{ item }">
          <span>{{ item.montantDevise.toFixed(2) }}</span>
        </template>
		<template v-slot:item.numeroCase="{ item }">
          <span>{{ item.numeroCase }} - {{item.libelleCase}}</span>
        </template>
		  </v-data-table>
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
  public periodeDisplay: string = "";
  public journalDisplay: string = "";
  public numeroPiece: number = 0;
  public pieceComptableData: PieceComptable = new PieceComptable();
  private contreparties: PieceComptableContrepartie[]=[];

  private headersContreparties = [
    { text: "Type", value: "typeCompte" },
    { text: "N° Compte", value: "numeroCompte" },
	{ text: "Nom compte", value: "compteLibelle" },
	{ text: "Libelle", value: "libelle" },
    { text: "Montant", value: "montantDevise", align: "end"},
	{ text: "Devise", value: "libelleDevise" },
	{ text: "Case TVA", value: "numeroCase" }
  ];

  @PropSync("dialogPiece")
  public dialog!: boolean;

  public Init(
    entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal
  ) {
    this.SetPeriodeDisplay(periode);
    this.SetJournalDisplay(journal);
    this.numeroPiece = entete.codePiece;

    axios
      .get<PieceComptable>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetPieceComptable?journal=" +
          entete.codeJournal +
          "&piece=" +
          entete.codePiece
      )
      .then(resp => {
		this.pieceComptableData = resp.data;
		this.contreparties = resp.data.contreparties;
      })
      .catch(error => {})
      .finally(() => {});
  }

  private SetPeriodeDisplay(periode: PeriodeComptable) {
    let stPeriode = "Courante";
    if (periode.typePeriodeComptable == "precedente") stPeriode = "Précédente";
    this.periodeDisplay = `${stPeriode} ${moment(periode.debut).format(
      "DD/MM/YYYY"
    )} ${moment(periode.fin).format("DD/MM/YYYY")}`;
  }

  private SetJournalDisplay(journal: Journal) {
    this.journalDisplay = `${journal.numero} -  ${journal.libelle}`;
  }

  @Emit("saveAction")
  private save() {}
}
</script>