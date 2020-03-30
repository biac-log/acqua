<template>
	<v-container fluid>
		<v-card>
			<v-row align="center" justify="start" class="pl-5 pr-5">
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
						:rules="rules"
					></v-select>
				</v-col>
				<v-col cols="12" xs="12" md="6" lg="3">
					<v-select
						v-model="journalSelected"
						:items="journaux"
						label="Sélection du journal"
						outlined
						:loading="journauxIsLoading"
						item-value="numero"
						:hint="`Nature ${journalSelected.famille} - Devise ${journalSelected.devise} - Dernière pièce ${journalSelected.numeroDernierePiece}`"
						return-object
						persistent-hint
						@click="LoadJournaux"
					>
						<template v-slot:selection="{ item }">{{item.numero}} - {{ item.libelle}}</template>
						<template v-slot:item="{ item }">{{item.numero}} - {{ item.libelle}}</template>
					</v-select>
				</v-col>
				<v-col cols="12" xs="12" md="3" lg="3">
					<v-btn color="warning" fab large dark class="mr-5">
						<v-icon>mdi-plus</v-icon>
					</v-btn>
					<v-btn color="primary" fab large dark @click="LoadPiecesComptables">
						<v-icon>mdi-magnify</v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</v-card>
		<v-card class="mt-5">
			<v-card-title>
				Pièces comptables
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
			>
				<template v-slot:item.datePiece="{ item }">
					<span>{{ getDate(item.datePiece) }}</span>
				</template>
				<template v-slot:item.dateEcheance="{ item }">
					<span>{{ getDate(item.dateEcheance) }}</span>
				</template>
				<template v-slot:item.montant="{ item }">
					<span>{{ item.montant.toFixed(2) }}</span>
				</template>
			</v-data-table>
		</v-card>
		<AchatVentePiece ref="refPiece" :dialogPiece.sync="dialogPieceMaster" @saveAction="updateRow()"></AchatVentePiece>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import {
  PeriodeComptable,
  Journal,
  EntetePieceComptable
} from "@/models/AchatVenteModels";
import moment from "moment";
import AchatVentePiece from "./components/AchatVentePiece.vue";

@Component({
  name: "AchatVente",
  components: { AchatVentePiece }
})
export default class extends Vue {
  private journalSelected: Journal = new Journal();
  private journaux: Journal[] = [];
  private journauxIsLoading: boolean = false;
  private detailJournalSelected: string = "";
  private periodeIsLoading: boolean = false;
  private periodeSelected: string = "";
  private periodes: string[] = ["Période courante", "Période précédente"];
  private libellePeriode: string = "";
  private periodeData: PeriodeComptable = new PeriodeComptable();
  private isErrorPeriode: boolean = false;
  private rules: any = [
    (v: any) => !this.isErrorPeriode || "Connexion impossible"
  ];

  private periodeSearched: PeriodeComptable = new PeriodeComptable();
  private journalSearched: Journal = new Journal();

  private headers = [
    { text: "Numéro pièce", value: "codePiece" },
    { text: "Date pièce", value: "datePiece" },
    { text: "Date échéance", value: "dateEcheance" },
    { text: "Numéro compte", value: "numeroCompte" },
    { text: "Nom compte", value: "nomCompte" },
    { text: "Libelle", value: "libelle" },
    { text: "Montant", value: "montant", align: "end" },
    { text: "Escompte", value: "escompte", align: "end" },
    { text: "Devise", value: "devise" },
    { text: "Status", value: "status" }
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
    axios
      .get<Journal[]>(
        process.env.VUE_APP_ApiAcQuaCore + "/AchatVente/GetJournaux"
      )
      .then(resp => {
        this.journaux = resp.data;
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
      })
      .catch(error => {})
      .finally(() => {
        this.isLoadingPieces = false;
      });
  }

  public getDate(date: Date): string {
    return moment(date).format("DD/MM/YYYY");
  }

  public OpenPieceComptable(entete: EntetePieceComptable) {
    this.dialogPieceMaster = true;

    (this.$refs.refPiece as AchatVentePiece).Init(
      entete,
      this.periodeSearched,
      this.journalSearched
    );
  }

  public UpdateRow() {}
}
</script>
