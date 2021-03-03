<template>
  <v-dialog v-model="display" ref="generateSocieteDialog" max-width="40%" eager>
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
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Dossier</th>
                <th class="text-left">Société créée</th>
                <th class="text-left">Synchronisé le</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="societe in societesToGenerate" :key="societe.identifiant">
                <td>{{ societe.path }}</td>
                <td>
                  <v-icon v-if="societe.created">mdi-check</v-icon>
                  <v-checkbox v-else @change="toggleSociete(societe.path)" />
                </td>
                <td>
                  <span v-if="societe.created && societe.synced">{{ societe.syncedAt }}</span>
                  <v-btn v-else-if="societe.created" color="warning"><v-icon>mdi-sync</v-icon>Synchroniser</v-btn>
                  <v-icon v-else>mdi-close</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <!-- <v-icon v-if="checkSocieteExiste(dossier)">mdi-check</v-icon>
            <v-progress-circular v-else-if="saveLoading" indeterminate color="primary" />
            <v-checkbox v-else @change="toggleSociete(dossier)"></v-checkbox>
          </v-col> -->
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
import { Societe } from '@/models/Societe/societe';
import { GenerateSociete } from '@/models/Societe/generateSociete';
import { SocieteModule } from '@/store/modules/companies';
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'GenerateSocietes',
  components: {},
})
export default class GenerateSocietes extends Vue {
  private display = false;
  private isLoading = false;
  private dossiers: string[] = [];
  private societesToGenerate: GenerateSociete[] = [];
  private selectedDossiers: string[] = [];
  private saveLoading = false;

  public async open() {
    this.display = true;
    this.loadDossiers();
  }

  private async loadDossiers() {
    this.isLoading = true;
    this.dossiers = await SocietesApi.getDirectories();
    this.dossiers.forEach((d) => {
      this.societesToGenerate.push(new GenerateSociete(d));
    });
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
    if (this.selectedDossiers.includes(societe)) {
      const index = this.selectedDossiers.indexOf(societe);
      this.selectedDossiers.splice(index, 1);
    } else {
      this.selectedDossiers.push(societe);
    }
  }

  private async generateSocietes() {
    this.saveLoading = true;
    let dossier: string;
    for (dossier of this.selectedDossiers) {
      const newSociete = new Societe();
      newSociete.name = this.societeIdentifiant(dossier);
      newSociete.identifiant = this.societeIdentifiant(dossier).toSlug();
      newSociete.apolloInstanceName = this.societeIdentifiant(dossier);
      await SocietesApi.createSociete(newSociete).then(async () => {
        const societe = this.societesToGenerate.find((s) => s.path == dossier);
        if(societe) {
          societe.created = true;
        }
        if (SocieteModule.societes.length <= 0) {
          SocieteModule.selectSociete(newSociete);
        }
        await SocietesApi.syncSociete(newSociete.identifiant);
      });

      await SocieteModule.fetchSocietes();
    }
    this.saveLoading = false;
    this.selectedDossiers = [];
  }
}
</script>

<style>
</style>