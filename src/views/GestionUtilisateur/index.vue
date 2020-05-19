<template>
  <v-container fluid class="pa-0 ma-0">
    <v-card>
      <v-card-title>
        Utilisateurs
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click="OpenUtilisateur()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-checkbox v-model="exclureInactifs" label="Exclure utilisateurs inactifs" hide-details></v-checkbox>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-card-text>
        <v-data-table
          id="dataTable"
          :headers="headers"
          :items="utilisateurs"
          :search="search"
          :loading="isLoading"
          @click:row="OpenUtilisateur"
          sort-by="ID"
          :footer-props="{'items-per-page-options': [25,100,500]}"
          :items-per-page="25"
          dense
        >
          <template v-slot:item.Applications="{ item }">
            <span>{{ getApplications(item, applications) }}</span>
          </template>
          <template v-slot:item.Email="{ item }">
            <v-simple-checkbox v-model="item.HasEmail" disabled></v-simple-checkbox>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <UtilisateurEditionVue ref="UtilisateurEdition"></UtilisateurEditionVue>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">
        {{
        snackbarColor == "error" ? "mdi-delete" : "mdi-check"
        }}
      </v-icon>
      <span v-html="snackbarMessage"></span>
      <v-btn icon dark @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import moment from "moment";
import { GestionUtilisateurApi } from "../../api/GestionUtilisateurApi";
import { displayAxiosError } from "@/utils/ErrorMethods";
import { Utilisateur } from "@/models/GestionUtilisateur/Utilisateur";
import { Pagination } from "@/models/Pagination";
import UtilisateurEditionVue from "./components/UtilisateurEdition.vue";
import { Application } from "../../models/GestionUtilisateur/Application";

@Component({
  name: "GestionUtilisateur",
  components: { UtilisateurEditionVue }
})
export default class extends Vue {
  private isErrorUtilisateur = false;
  private isLoading = false;
  private utilisateurs: Utilisateur[] = [];
  private applications: Application[] = [];
  private utilisateurSelected: Utilisateur = new Utilisateur();
  private search: string = "";
  private totalItems: number = 0;
  private exclureInactifs = true;

  private headers = [
    { text: "Code", value: "ID", width: 80 },
    { text: "Nom Prénom", value: "NomPrenom", width: 200 },
    { text: "Email", value: "Email", width: 40 },
    { text: "Département", value: "Departement", width: 150 },
    { text: "Applications", value: "Applications", width: 250 },
    { text: "Permissions", value: "Permission", width: 250 }
  ];

  mounted() {
    this.LoadUtilisateurs();
  }

  @Watch("exclureInactifs")
  private async LoadUtilisateurs() {
    try {
      this.utilisateurs = [];
      this.isLoading = true;
      this.applications = await GestionUtilisateurApi.getApplications();
      this.utilisateurs = await GestionUtilisateurApi.getUtilisateurs(
        this.exclureInactifs
      );
    } catch (err) {
      this.isErrorUtilisateur = true;
    } finally {
      this.isLoading = false;
    }
  }

  private OpenUtilisateur(utilisateur: Utilisateur) {
    (this.$refs.UtilisateurEdition as UtilisateurEditionVue)
      .open(utilisateur, this.applications)
      .then(resp => {
        Vue.set(
          this.utilisateurs,
          this.utilisateurs.findIndex(e => e.ID == resp.ID),
          resp
        );
        this.notifier(
          `Utilisateur <b>${resp.NomPrenom}</b> mis à jour.`,
          "success"
        );
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      })
      .catch(() => {});
  }

  private getApplications = (utilisateur: Utilisateur, apps: Application[]) => {
    const appIds = utilisateur.Permissions?.map(e => e.ApplicationId).filter(
      this.onlyUnique
    );
    const appNames: string[] = [];

    appIds.forEach(element => {
      const app = apps.find(e => e.Id === element);
      if (app) appNames.push(app.Nom);
    });
    return appNames.join(", ");
  };

  private onlyUnique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
  }

  private snackbar: boolean = false;
  private snackbarTimeout: number = 5000;
  private snackbarMessage: string = "";
  private snackbarColor: string = "";

  private notifier(message: string, color: string) {
    this.snackbarColor = color;
    this.snackbarMessage = message;
    this.snackbar = true;
  }
}
</script>

<style scopped>
.v-data-table {
  word-break: initial;
  white-space: nowrap;
}

#dataTable tbody tr {
  cursor: pointer;
}

tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
