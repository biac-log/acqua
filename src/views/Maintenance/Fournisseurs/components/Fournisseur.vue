<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{fournisseur.nom}}</v-card-title>
        <v-spacer></v-spacer>
          <v-tooltip v-if="readonly" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                class="mr-5"
                color="success"
                :disabled="isLoading"
                @click="modifierFournisseur"
                v-on="on"
              >
                <v-icon left>mdi-pencil</v-icon>Modifier
              </v-btn>
            </template>
            <span>
              Modifier la pièce
              <span class="shortcutTooltip">F2</span>
            </span>
          </v-tooltip>
          <v-tooltip v-if="readonly" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                class="mr-10"
                color="error"
                :disabled="saveLoading"
                @click="deleteFournisseur"
                :loading="deleteLoading"
              >
                <v-icon left>mdi-delete</v-icon>Supprimer
              </v-btn>
            </template>
            <span>
              Supprimer la pièce
              <span class="shortcutTooltip">del</span>
            </span>
          </v-tooltip>
          <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
      </v-toolbar>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import { Fournisseur } from '@/models/Fournisseur/Get/Fournisseur';

@Component({
  name: 'FournisseurVue'
})
export default class FournisseurVue extends Vue {
  private display = false;

  private saveLoading = false;
  private deleteLoading = false;
  get isLoading() {
    return this.saveLoading || this.deleteLoading;
  }

  private fournisseur: Fournisseur = new Fournisseur();

  public open(searchFournisseur: SearchFournisseur) {
    this.display = true;

    // TODO : retrieve all the datas from the API
    const fournisseur = new Fournisseur();
    fournisseur.type = searchFournisseur.type;
    fournisseur.numero = searchFournisseur.numero;
    fournisseur.matchCode = searchFournisseur.matchCode;
    fournisseur.nom = searchFournisseur.nom;
    fournisseur.solde = searchFournisseur.solde;
    fournisseur.adresse = searchFournisseur.adresse;

    this.fournisseur = fournisseur;
  }

  private closeDialog() {
    this.display = true;
  }

  private modifierFournisseur() {
    console.log("modifier");
  }

  private deleteFournisseur() {
    console.log("delete");
  }
}
</script>

<style>
</style>