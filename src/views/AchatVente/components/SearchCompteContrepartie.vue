<template>
  <v-dialog width="800" v-model="dialog" @click:outside="close">
    <v-card class="mt-5">
      <v-card-title>
        Comptes {{ typeLoad ? typeLoad.libelle : "" }}
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
          @keydown.enter="trySend"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        id="dataTable"
        ref="dataTable"
        height="600"
        dense
        disable-pagination
        fixed-header
        hide-default-footer
        :headers="headersComptes"
        :items="comptes"
        :loading="isLoading"
        :search="filtreCompte"
        @click:row="sendCompte"
        @current-items="setFilteredItems"
      >
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";
import {TypeCompte} from "@/models/AchatVente";
import CompteGeneralSearch from "@/models/Compte/CompteGeneralSearch";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import { CompteApi } from "@/api/CompteApi";
import axios from "axios";

@Component({
  name: "SearchCompteContrepartie"
})
export default class extends Vue {
  private dialog: boolean = false;
  private typeLoad: TypeCompte = new TypeCompte();
  private filtreCompte: string = "";
  private isLoading: boolean = false;
  private comptes: CompteGeneralSearch[] = [];
  private displayComptes: CompteGeneralSearch[] = [];
  private headersComptes = [
    { text: "Numéro", value: "numero", width: 100 },
    { text: "Nom", value: "nom", width: 100 },
    { text: "Solde", value: "libelleSolde", align: "end", width: 100 },
    { text: "Nature", value: "libelleNature", width: 100 },
    { text: "Case TVA", value: "libelleCase", width: 100 }
  ];

  private resolve!: any;
  private reject!: any;

  public open(typeToLoad: TypeCompte): Promise<CompteGeneralSearch> {
    this.dialog = true;
    this.loadComptes(typeToLoad);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setFilteredItems(e : CompteGeneralSearch[]){
    this.displayComptes = e;
  }

  private loadComptes(typeToLoad: TypeCompte) {
    if (this.typeLoad.id != typeToLoad.id) {
      this.typeLoad = typeToLoad;
      this.refreshComptes();
    }
  }

  private refreshComptes() {
    if (this.typeLoad.id) {
      this.isLoading = true;
      CompteApi.getComptesGeneraux(this.typeLoad.id)
        .then(resp => {
          this.comptes = resp;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private trySend(){
    if(this.displayComptes.length == 1)
      this.sendCompte(this.displayComptes[0]);
  }

  private sendCompte(compte: CompteGeneralSearch) {
    this.dialog = false;
    this.resolve(compte);
  }

  private close(){
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
