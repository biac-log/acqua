<template>
  <v-dialog v-model="display" ref="generateSocieteDialog" max-width="60%" eager>
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
        <ul>
            <li v-for="dossier in dossiers" :key="dossier">{{dossier}}</li>
        </ul>
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
        <!-- <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              ref="btnValidate"
              v-on="on"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              color="success"
              :loading="saveLoading"
              :disabled="deleteLoading"
              @click="saveModel()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder la société
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip> -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import SocietesApi from '@/api/SocietesApi';
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'GenerateSocietes',
  components: {},
})
export default class GenerateSocietes extends Vue {
  private display = false;
  private isLoading = false;
  private dossiers: string[] = [];

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
}
</script>

<style>
</style>