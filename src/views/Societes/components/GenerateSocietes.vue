<template>
  <v-dialog
    v-model="display"
    ref="generateSocieteDialog"
    max-width="30%"
    eager
    :persistent="saveLoading"
    @click:outside="clickOutside"
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>Générer les sociétés</v-card-title>
        <v-spacer></v-spacer>
        <v-btn ref="buttonClose" class="ml-5" icon color="white" @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <!-- <AlertMessageVue ref="alertMessage" class="alertMessage" type="warning" />
        <AlertMessageVue ref="successMessage" class="alertMessage" type="success" /> -->
        <v-data-table :headers="headers" :items="dossiers" disable-pagination hide-default-footer>
          <template v-slot:[`item.created`]="{ item }">
            <v-icon v-if="item.created && !item.error">mdi-check</v-icon>
            <v-progress-circular v-else-if="saveLoading" indeterminate color="primary" />
            <v-tooltip top open-delay="500" v-else-if="item.error">
              <template v-slot:activator="{ on }"><v-icon v-on="on">mdi-close</v-icon> </template>
              <span>{{ error }}</span></v-tooltip
            >
            <v-checkbox v-else @change="toggleSociete(item.path)"></v-checkbox>
          </template>
          <!-- <template v-slot:[`item.synced`]="{ item }">
            <v-icon v-if="item.synced">mdi-check</v-icon>
            <v-progress-circular v-else-if="saveLoading && !item.c" indeterminate color="primary" />            
          </template> -->
        </v-data-table>
        <!-- <v-row v-for="dossier in dossiers" :key="dossier" dense align="center">
          <v-col
            ><span>{{ dossier }}</span></v-col
          >
          <v-col>
            <v-icon v-if="checkSocieteExiste(dossier)">mdi-check</v-icon>
            <v-progress-circular v-else-if="saveLoading" indeterminate color="primary" />
            <v-checkbox v-else @change="toggleSociete(dossier)"></v-checkbox>
          </v-col>
        </v-row> -->
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <!-- <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              color="blue darken-1"
              class="ma-2 mt-0 pr-4 align-self-start"
              :disabled="saveLoading"
              tile
              outlined
              @click="cancelEdit()"
              tabindex="-1"
              v-on="on"
            >
              <v-icon left>mdi-close</v-icon>Annuler
            </v-btn>
          </template>
          <span>Annuler les modifications</span>
        </v-tooltip> -->
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              ref="btnValidate"
              v-on="on"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              color="success"
              :loading="saveLoading"
              :disabled="selectedDossiers.isEmpty()"
              @click="generateSocietes()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Générer
            </v-btn>
          </template>
          <span>
            Générer les sociétés
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import SocietesApi from '@/api/SocietesApi';
import SynchronisationApi from '@/api/SynchronisationApi';
import { Societe } from '@/models/Societe/societe';
import { SocieteGen } from '@/models/Societe/SocieteGen';
import { SocieteModule } from '@/store/modules/companies';
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'GenerateSocietes',
  components: {},
})
export default class GenerateSocietes extends Vue {
  private display = false;
  private isLoading = false;
  private dossiers: SocieteGen[] = [];
  private selectedDossiers: SocieteGen[] = [];
  private saveLoading = false;

  private headers = [
    { text: 'Dossier', value: 'path' },
    { text: '', value: 'created' },
  ];

  public async open() {
    this.display = true;
    this.loadDossiers();
  }

  private async loadDossiers() {
    this.isLoading = true;
    this.dossiers = await SocietesApi.getDirectories();
    this.isLoading = false;
  }

  private closeDialog() {
    this.display = false;
  }

  private checkSocieteExiste(dossier: string): boolean {
    return SocieteModule.societes.some(
      (s) => (s.name.toLowerCase() || s.identifiant.toLowerCase()) == this.societeIdentifiant(dossier)
    );
  }

  private societeIdentifiant(path: string): string {
    const array = path.split('\\');
    return array.last().toLowerCase();
  }

  private toggleSociete(societe: string) {
    const add = new SocieteGen(societe);
    if (this.selectedDossiers.includes(add)) {
      const index = this.selectedDossiers.indexOf(add);
      this.selectedDossiers.splice(index, 1);
    } else {
      this.selectedDossiers.push(add);
    }
  }

  private async generateSocietes() {
    this.saveLoading = true;
    let dossier: SocieteGen;
    for (dossier of this.selectedDossiers) {
      const newSociete = new Societe();
      newSociete.name = this.societeIdentifiant(dossier.path);
      newSociete.identifiant = this.societeIdentifiant(dossier.path).toSlug();
      newSociete.apolloInstanceName = this.societeIdentifiant(dossier.path);
      await SocietesApi.createSociete(newSociete)
        .then(async () => {
          dossier.created = true;
          await SynchronisationApi.SyncAll().catch(() => {
            dossier.error = 'Une erreur est survenue pendant la synchronisation';
          });
        })
        .catch(() => {
          dossier.error = 'Une erreur est survenue pendant la création';
        });
      await SocieteModule.fetchSocietes();
    }
    this.saveLoading = false;
    this.selectedDossiers = [];
  }

  private clickOutside() {
    if (!this.saveLoading) this.closeDialog();
  }
}
</script>

<style>
</style>