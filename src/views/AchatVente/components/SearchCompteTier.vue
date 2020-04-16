<template>
  <v-dialog width="1000" v-model="dialog" @click:outside="close()" @keydown.esc="close()">
    <v-card class="mt-5">
      <v-card-title>
        Comptes
        <v-btn color="primary" fab small class="ml-5" @click="refreshComptes">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreCompte"
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
        dense
        fixed-header
        :footer-props="{
          'items-per-page-options': [30,50,100]
        }"
        :items-per-page="30"
        :headers="headersComptes"
        :items="comptes"
        :loading="isLoading"
        :search="filtreCompte"
        @click:row="sendCompte"
      >
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import CompteSearch from "@/models/Compte/CompteSearch";
import { CompteApi } from "@/api/CompteApi";
import axios from "axios";

@Component({
  name: "SearchCompteTier"
})
export default class extends Vue {
  private dialog: boolean = false;

  private typeLoad!: string;
  private filtreCompte: string = "";
  private isLoading: boolean = false;
  private comptes: CompteSearch[] = [];
  private headersComptes = [
    { text: "Numéro", value: "numero" },
    { text: "Nom", value: "nom" },
    { text: "Raison sociale", value: "raisonSocial" },
    { text: "Adresse", value: "adresse" }
  ];

  private resolve!: any;
  private reject!: any;

  public open(typeToLoad: string): Promise<CompteSearch> {
    this.dialog = true;
    this.loadComptes(typeToLoad);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private loadComptes(typeToLoad: string) {
    if (this.typeLoad != typeToLoad) {
      this.typeLoad = typeToLoad;
      this.refreshComptes();
    }
  }

  private refreshComptes() {
    if (this.typeLoad) {
      this.isLoading = true;
      CompteApi.getComptesTiers(this.typeLoad)
        .then(resp => {
          this.comptes = resp;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private sendCompte(compte: CompteSearch) {
    this.filtreCompte = "";
    this.dialog = false;
    this.resolve(compte);
  }

  private close(){
    this.filtreCompte = "";
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
