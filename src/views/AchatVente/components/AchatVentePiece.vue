<template>
	<v-dialog v-model="dialog" scrollable width="1000">
		<v-card>
			<v-card-title class="d-flex justify-start">
				<v-row>
					<v-col cols="6">
						<v-text-field
							label="Période"
							:value="periodeDisplay"
							outlined
							dense
							readonly
							filled
							hide-details
							class="ma-2"
						></v-text-field>
					</v-col>
					<v-col cols="3">
						<v-text-field
							label="Journal"
							:value="journalDisplay"
							outlined
							dense
							filled
							readonly
							hide-details
							class="ma-2"
						></v-text-field>
					</v-col>
					<v-col cols="3">
						<v-text-field
							label="Numéro pièce"
							:value="numeroPiece"
							outlined
							dense
							filled
							readonly
							hide-details
							class="ma-2"
						></v-text-field>
					</v-col>
				</v-row>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text></v-card-text>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  Journal
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
      .get<EntetePieceComptable[]>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetPieceComptable?journal=" +
          entete.codeJournal +
          "&stPeriode=" +
          entete.codePiece +
          "&stPeriode=" +
          periode.typePeriodeComptable
      )
      .then(resp => {})
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