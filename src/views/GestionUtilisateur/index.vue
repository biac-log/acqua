<template>
  <v-container fluid class="pa-0 ma-0">
    <v-card>
      <v-card-title>
        Utilisateurs
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click="openUtilisateur()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-checkbox v-model="exclureInactifs" label="Exclure utilisateurs inactifs" hide-details></v-checkbox>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Filtrer"
          single-line
          hide-details
          autofocus
          ref="recherche"
        ></v-text-field>
      </v-card-title>
      <v-card-text class="ma-0 pa-0">
        <v-data-table
          id="dataTable"
          :headers="headers"
          :items="utilisateurs"
          :search="search"
          :loading="isLoading"
          fixed-header
          @click:row="openUtilisateur"
          sort-by="ID"
          :footer-props="{ 'items-per-page-options': [10, 100, 500] }"
          :items-per-page="10"
          style="width:100%; height:100%;"
        >
          <template v-slot:[`item.ApplicationsNom`]="{ item }">
            <v-chip
              class="ma-1"
              text-color="white"
              :color="getColor(app)"
              v-for="app in item.ApplicationsList"
              :key="app"
              @click.stop="setFiltre(app)"
            >
              <span>{{ app }}</span>
            </v-chip>
          </template>
          <template v-slot:[`item.HasEmail`]="{ item }">
            <v-simple-checkbox v-model="item.HasEmail" disabled></v-simple-checkbox>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <UtilisateurEditionVue ref="UtilisateurEdition"></UtilisateurEditionVue>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <v-icon dark class="mr-3">
        {{ snackbarColor == 'error' ? 'mdi-delete' : 'mdi-check' }}
      </v-icon>
      <span v-html="snackbarMessage"></span>
      <v-btn icon dark @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { GestionUtilisateurApi } from '../../api/GestionUtilisateurApi';
import { Utilisateur } from '@/models/GestionUtilisateur/Utilisateur';
import UtilisateurEditionVue from './components/UtilisateurEdition.vue';
import { Application } from '../../models/GestionUtilisateur/Application';

@Component({
  name: 'GestionUtilisateur',
  components: { UtilisateurEditionVue }
})
export default class extends Vue {
  private isErrorUtilisateur = false;
  private isLoading = false;
  private utilisateurs: Utilisateur[] = [];
  private applications: Application[] = [];
  private utilisateurSelected: Utilisateur = new Utilisateur();
  private search = '';
  private totalItems = 0;
  private exclureInactifs = true;

  private headers = [
    { text: 'Code', value: 'ID', width: 80 },
    { text: 'Nom Prénom', value: 'NomPrenom', width: 200 },
    { text: 'Email', value: 'HasEmail', width: 40 },
    { text: 'Département', value: 'Departement', width: 150 },
    { text: 'Applications', value: 'ApplicationsNom', width: 250 }
  ];

  mounted() {
    this.loadUtilisateurs();
  }

  @Watch('exclureInactifs')
  private async loadUtilisateurs() {
    try {
      this.utilisateurs = [];
      this.isLoading = true;
      this.applications = await GestionUtilisateurApi.getApplications();
      const utilisateurs = await GestionUtilisateurApi.getUtilisateurs(this.exclureInactifs);
      this.utilisateurs = [];
      utilisateurs.forEach((element) => {
        element.Applications = this.applications;
        this.utilisateurs.push(element);
      });
    } catch (err) {
      this.isErrorUtilisateur = true;
    } finally {
      this.isLoading = false;
    }
  }

  private openUtilisateur(utilisateur: Utilisateur) {
    (this.$refs.UtilisateurEdition as UtilisateurEditionVue)
      .open(utilisateur, this.applications)
      .then((resp) => {
        if (this.utilisateurs.some((e) => e.ID === resp.ID)) {
          resp.Applications = this.applications;
          Vue.set(
            this.utilisateurs,
            this.utilisateurs.findIndex((e) => e.ID === resp.ID),
            resp
          );
          this.notifier(`Utilisateur <b>${resp.NomPrenom} (${resp.ID})</b> mis à jour.`, 'success');
        } else {
          resp.Applications = this.applications;
          this.utilisateurs.push(resp);
          this.notifier(`Utilisateur <b>${resp.NomPrenom} (${resp.ID})</b> ajouté.`, 'success');
        }
      })
      .catch()
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private colorsApplications: [string, string][] = [];
  private colorsAvailable: string[] = [
    'primary',
    'indigo',
    'orange',
    'green',
    'teal',
    'black',
    'red',
    'pink',
    'cyan',
    'deep purple',
    'purple',
    'yellow',
    'grey',
    'brown',
    'lime',
    'blue grey',
    'light blue',
    'amber',
    '#76FF03',
    '#E65100'
  ];

  private getColor(nomApplication: string): string {
    const sameApp = this.colorsApplications.find((e) => e[0] === nomApplication);
    if (sameApp) return sameApp[1];

    const color = this.colorsAvailable[0];
    this.colorsAvailable.splice(0, 1);
    this.colorsApplications.push([nomApplication, color]);
    return color;
  }

  private setFiltre(app: string) {
    this.search = app;
    this.$nextTick(() => (this.$refs.recherche as any).$el.focus());
  }

  private snackbar = false;
  private snackbarTimeout = 5000;
  private snackbarMessage = '';
  private snackbarColor = '';

  private notifier(message: string, color: string) {
    this.snackbarColor = color;
    this.snackbarMessage = message;
    this.snackbar = true;
  }
}
</script>

<style scopped>
#dataTable tbody tr {
  cursor: pointer;
}
</style>
