<template>
  <v-dialog width="1200" v-model="showDialog">
    <v-card class="mt-5">
      <v-card-title>
        Comptes
        <v-btn color="primary" rounded class="ml-5" @click="refreshComptes">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="filtreCompte"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        id="dataTable"
        height=530
        :headers="headersComptes"
        :items="comptes"
        :loading="isLoading"
        :search="filtreCompte"
        @click:row="sendCompte"
        cursor="pointer"
      >
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import { ICompteSearch } from "@/models/ICompte";
import axios from "axios";

@Component({
  name: "SearchCompteTier"
})
export default class extends Vue {
  @PropSync("dialog")
  private showDialog!: boolean;
  private numero: string = "";
  private matchCode: string = "";
  private texte: string = "";

  private typeLoad!: string;
  private filtreCompte: string = "";
  private isLoading: boolean = false;
  private comptes: ICompteSearch[] = [];
  private headersComptes = [
    { text: "Numéro", value: "numero" },
    { text: "Nom", value: "nom" },
    { text: "Raison sociale", value: "raisonSocial" },
    { text: "Adresse", value: "adresse" }
  ];

  public loadComptes(typeToLoad: string) {
    if (this.typeLoad != typeToLoad) {
      this.typeLoad = typeToLoad;
      this.refreshComptes();
    }
  }

  @Emit('compteSelected')
  public sendCompte(compte: ICompteSearch){
    this.showDialog = false;
    return compte;
  }

  private refreshComptes() {
    if (this.typeLoad) {
      this.isLoading = true;
      axios
        .get<ICompteSearch[]>(
          `${process.env.VUE_APP_ApiAcQuaCore}/Compte/GetAllComptesByType?typeCompte=${this.typeLoad}`
        )
        .then(resp => {
          this.comptes = resp.data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
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
