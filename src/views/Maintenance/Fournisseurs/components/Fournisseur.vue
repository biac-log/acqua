<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
        <v-toolbar color="primary" dark flat>
            <v-card-title>{{fournisseur.nom}}</v-card-title>
        </v-toolbar>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import {Fournisseur} from '@/models/Fournisseur/Get/Fournisseur'

    @Component({
  name: 'FournisseurVue',
})
export default class FournisseurVue extends Vue {

  private display = false;

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
}
</script>

<style>
</style>