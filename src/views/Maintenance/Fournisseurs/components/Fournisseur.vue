<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{fournisseur.displayName}}</v-card-title>
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
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <v-row justify="center" dense class="pt-5">
          <v-col cols="3" class="pr-5">
            <v-row dense>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Numéro"
                  v-model="fournisseur.numero"
                  :filled="readonly"
                  disabled
                  readonly
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Raison sociale"
                  v-model="fournisseur.raisonSociale"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="11"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Nom"
                  v-model="fournisseur.nom"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="23"
                  :rules="rules.nom"
                />
              </v-col>

              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Match code"
                  v-model="fournisseur.matchCode"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="23"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pr-5 pl-5">
            <v-row dense>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Adresse"
                  v-model="fournisseur.adresseLigne1"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="35"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Complément d'adresse"
                  v-model="fournisseur.adresseLigne2"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="35"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Code Postal"
                  v-model="fournisseur.codePostal"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="8"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Localité"
                  v-model="fournisseur.localité"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="30"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Pays"
                  v-model="fournisseur.codePays"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="3"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pr-5 pl-5">
            <v-row dense>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Téléphone"
                  v-model="fournisseur.numeroTelephone"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="14"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Contact 1"
                  v-model="fournisseur.contact1"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="30"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Fax"
                  v-model="fournisseur.téléfax"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="14"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Contact 2"
                  v-model="fournisseur.contact2"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="30"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="GSM"
                  v-model="fournisseur.gsm"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="14"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Contact 3"
                  v-model="fournisseur.contact3"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="30"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pl-5">
            <v-row dense>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Commentaire 1"
                  v-model="fournisseur.commentaire1"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="20"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Commentaire 2"
                  v-model="fournisseur.commentaire2"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="20"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  dense
                  label="Commmentaire 3"
                  v-model="fournisseur.commmentaire3"
                  :filled="readonly"
                  :disabled="readonly"
                  :counter="!readonly"
                  maxlength="20"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              color="error"
              v-on="on"
              class="ma-2 pr-4 align-self-start"
              text
              tabindex="-1"
              @click="cancelEdit()"
              :disabled="saveLoading"
              :loading="deleteLoading"
            >Annuler</v-btn>
          </template>
          <span>
            Annuler les modifications
            <span class="shortcutTooltip">del</span>
          </span>
        </v-tooltip>

        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              ref="btnValidate"
              v-on="on"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              color="success"
              :loading="saveLoading"
              :disabled="deleteLoading"
              @click="saveFournisseur()"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder le fournisseur
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import { Fournisseur } from '@/models/Fournisseur/Get/Fournisseur';
import { FournisseurApi } from '@/api/FournisseurApi';

@Component({
  name: 'FournisseurVue'
})
export default class FournisseurVue extends Vue {
  private display = false;

  private saveLoading = false;
  private deleteLoading = false;
  private getLoading = false;
  get isLoading() {
    return this.saveLoading || this.deleteLoading || this.getLoading;
  }

  private fournisseur: Fournisseur = new Fournisseur();
  private fournisseurBase: Fournisseur = new Fournisseur(); // Used for the reset method
  private rules = Fournisseur.rules; // Rules are declared wwithin the model

  private readonly = true;

  public open(searchFournisseur: SearchFournisseur) {
    this.display = true;

    const fournisseur = new Fournisseur();
    fournisseur.numero = searchFournisseur.numero;
    fournisseur.nom = searchFournisseur.nom;

    this.loadFournisseur(searchFournisseur.numero);
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
  }

  private async loadFournisseur(numero: number) {
    this.getLoading = true;

    const fournisseurDTO = await FournisseurApi.getFournisseurByNumero(numero);

    this.fournisseur = new Fournisseur(fournisseurDTO);
    this.fournisseurBase = new Fournisseur(fournisseurDTO);

    this.getLoading = false;
  }

  private modifierFournisseur() {
    if (!this.getLoading) {
      this.readonly = false;
    }
  }

  private deleteFournisseur() {
    console.log('delete');
  }

  private async saveFournisseur() {
    this.saveLoading = true;

    await FournisseurApi.UpdateFournisseur(this.fournisseur.numero, this.fournisseur);
  }

  private cancelEdit() {
    this.fournisseur = this.fournisseurBase;
    this.readonly = true;
  }
}
</script>

<style scoped>
fieldset {
  padding-right: 10px;
  padding-left: 10px;
}
</style>