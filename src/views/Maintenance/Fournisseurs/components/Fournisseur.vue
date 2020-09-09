<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{fournisseur.displayName}}</v-card-title>
        <v-spacer></v-spacer>
        <!--  <v-tooltip v-if="readonly" top open-delay="500">
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
        </v-tooltip>-->
        <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <v-row justify="center" dense>
          <v-col cols="4" dense>
            <fieldset>
              <legend>Dénomination</legend>
              <v-row dense>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Numéro"
                    v-model="fournisseur.numero"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="8" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Nom"
                    v-model="fournisseur.nom"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Raison sociale"
                    v-model="fournisseur.raisonSociale"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="8" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Match code"
                    v-model="fournisseur.matchCode"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
              </v-row>
            </fieldset>
          </v-col>
          <v-col cols="4" dense>
            <fieldset>
              <legend>Adresse</legend>
              <v-row dense>
                <v-col cols="6" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Ligne 1"
                    v-model="fournisseur.adresseLigne1"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="6" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Ligne 2"
                    v-model="fournisseur.adresseLigne2"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Code Postal"
                    v-model="fournisseur.codePostal"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Localité"
                    v-model="fournisseur.localité"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Pays"
                    v-model="fournisseur.codePays"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
              </v-row>
            </fieldset>
          </v-col>
          <v-col cols="4" dense>
            <fieldset>
              <legend>Contact</legend>
              <v-row dense>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Téléphone"
                    v-model="fournisseur.numeroTelephone"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Fax"
                    v-model="fournisseur.téléfax"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="GSM"
                    v-model="fournisseur.gsm"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Contact 1"
                    v-model="fournisseur.contact1"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Contact 2"
                    v-model="fournisseur.contact2"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
                <v-col cols="4" class="pb-0 pt-0">
                  <v-text-field
                    dense
                    label="Contact 3"
                    v-model="fournisseur.contact3"
                    :filled="readonly"
                    :disabled="readonly"
                  />
                </v-col>
              </v-row>
            </fieldset>
          </v-col>
        </v-row>
      </v-card-text>
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
  }

  private async loadFournisseur(numero: number) {
    this.getLoading = true;

    const fournisseurDTO = await FournisseurApi.getFournisseurByNumero(numero);

    this.fournisseur = new Fournisseur(fournisseurDTO);

    this.getLoading = false;
  }

  private modifierFournisseur() {
    console.log('modifier');
  }

  private deleteFournisseur() {
    console.log('delete');
  }
}
</script>

<style scoped>
  fieldset {
    padding-right: 10px;
    padding-left: 10px;
  }
</style>