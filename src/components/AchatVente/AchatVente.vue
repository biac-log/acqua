<template>
	<v-container fluid>
		<v-card>
			<v-row align="center" justify="start">
				<v-col cols="auto">
					<v-radio-group
						v-model="periode"
						row
						@change="LoadPeriode"
						:messages="libellePeriode"
						class="ml-5 mr-5 mt-0"
					>
						<v-radio label="Période courante" value="Courante"></v-radio>
						<v-radio label="Période précédente" value="Precedente"></v-radio>
					</v-radio-group>
				</v-col>
				<v-col cols="auto" class="d-flex align-center">
					<v-text-field
						label="Journal"
						placeholder="Numéro"
						append-icon="mdi-magnify"
						type="number"
						outlined
						v-model="NumeroJournal"
						@keydown.enter="LoadJournal"
						:loading="journalIsLoading"
						hide-details="true"
						@click:append="searchJournalDialog = true"
					></v-text-field>
					<!-- <v-btn @click="searchJournalDialog = true" outlined fab small color="blue" class="ml-2">
						<v-icon>mdi-magnify</v-icon>
					</v-btn>-->
				</v-col>
				<v-col cols="auto" class="d-flex align-center">
					<p>{{LibelleJournal}}</p>
				</v-col>
			</v-row>
		</v-card>
		<v-snackbar v-model="errorPopup" :timeout="timeout" color="error" top>
			{{ errorMessage }}
			<v-btn color="black" text @click="errorPopup = false">Close</v-btn>
		</v-snackbar>
		<v-row justify="center">
			<v-dialog v-model="searchJournalDialog" scrollable max-width="300px">
				<v-card>
					<v-card-title>Sélection d'un journal</v-card-title>
					<v-divider></v-divider>
					<v-card-text style="height: 300px;"></v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="blue darken-1" text @click="searchJournalDialog = false">Fermer</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>
	</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import { PeriodeComptable } from "@/models/PeriodeComptable";
import moment from "moment";
import { JournalAV } from "@/models/JournalAV";

@Component({
  name: "AchatVente"
})
export default class extends Vue {
  public Title: string = "";
  public periode: string = "Courante";
  public NumeroJournal: number = 0;
  public LibelleJournal: string = "";
  public errorMessage: string = "";
  public errorPopup: boolean = false;
  public timeout: number = 5000;
  public journalIsLoading: boolean = false;
  public searchJournalDialog: boolean = false;
  public libellePeriode: string = "";
  mounted() {
    this.LoadPeriode();
  }

  public LoadPeriode() {
    axios
      .get<PeriodeComptable>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetPeriode" +
          this.periode
      )
      .then(resp => {
        this.libellePeriode =
          "Début " +
          moment(resp.data.debut).format("DD/MM/YYYY") +
          " - Fin " +
          moment(resp.data.fin).format("DD/MM/YYYY");
      })
      .catch(error => {
        this.errorPopup = true;
        this.errorMessage = error.response.data;
      });
  }

  public LoadJournal() {
    this.journalIsLoading = true;
    axios
      .get<JournalAV>(
        process.env.VUE_APP_ApiAcQuaCore +
          "/AchatVente/GetJournal?numero=" +
          this.NumeroJournal
      )
      .then(resp => {
        this.LibelleJournal = resp.data.libelle;
      })
      .catch(error => {
        this.errorPopup = true;
        this.errorMessage = error.response.data;
      })
      .finally(() => {
        this.journalIsLoading = false;
      });
  }
}
</script>
