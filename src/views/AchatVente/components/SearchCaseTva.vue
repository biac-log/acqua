<template>
  <v-dialog width="600" v-model="dialog" @click:outside="close" @keydown.esc="close()">
    <v-card class="mt-5">
      <v-card-title>
        Case Tva
        <v-btn color="primary" fab class="ml-5" small @click="refreshcasesTva">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreCaseTva"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
        ></v-text-field>
      </v-card-title>
      <v-data-table
        id="dataTable"
        height="530"
        :headers="headersCasesTva"
        :items="casesTva"
        :loading="isLoading"
        :search="filtreCaseTva"
        @click:row="sendCaseTva"
        disable-pagination
      >
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import { CaseTva } from "@/models/AchatVente";
import { CompteApi } from "@/api/CompteApi";
import axios from "axios";
import { AchatVenteApi } from '@/api/AchatVenteApi';

@Component({
  name: "SearchCompteTier"
})
export default class extends Vue {
  private dialog: boolean = false;

  private numeroJournalLoad!: number;
  private filtreCaseTva: string = "";
  private isLoading: boolean = false;
  private casesTva: CaseTva[] = [];
  private headersCasesTva = [
    { text: "Numéro case", value: "numeroCase" , align: "end" },
    { text: "Libellé", value: "libelleCase" },
    { text: "Type", value: "libelleTypeCase" },
    { text: "Nature", value: "natureCase" },
    { text: "Taux", value: "tauxTvaCase", align: "end" }
  ];

  private resolve!: any;
  private reject!: any;

  public open(numeroJournal: number): Promise<CaseTva> {
    this.dialog = true;
    this.loadcasesTva(numeroJournal);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadcasesTva(numeroJournalLoad: number) {
    if (this.numeroJournalLoad != numeroJournalLoad) {
      this.numeroJournalLoad = numeroJournalLoad;
      this.refreshcasesTva();
    }
  }

  private refreshcasesTva() {
    if (this.numeroJournalLoad) {
      this.isLoading = true;
      AchatVenteApi.getCasesTVADisponibles(this.numeroJournalLoad)
        .then(resp => {
          this.casesTva = resp;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private sendCaseTva(caseTva: CaseTva) {
    this.filtreCaseTva = "";
    this.dialog = false;
    this.resolve(caseTva);
  }

  private close(){
    this.filtreCaseTva = "";
    this.dialog = false;
    this.reject();
  }
}
</script>

<style>
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}
</style>
