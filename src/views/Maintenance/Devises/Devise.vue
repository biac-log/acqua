<template>
  <v-dialog
    v-model="display"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierDevise"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveDevise()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="deviseDialog"
    max-width="20%"
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouvelle Devise' : `${id} - ${libelle}` }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn class="mr-5" color="success" :disabled="isLoading" @click="modifierDevise" v-on="on">
              <v-icon left>mdi-pencil</v-icon>Modifier
            </v-btn>
          </template>
          <span>
            Modifier la devise
            <span class="shortcutTooltip">F2</span>
          </span>
        </v-tooltip>
        <!-- <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              class="mr-10"
              color="error"
              :disabled="saveLoading"
              @click="deleteDevise"
              :loading="deleteLoading"
            >
              <v-icon left>mdi-delete</v-icon>Supprimer
            </v-btn>
          </template>
          <span>
            Supprimer la pièce
            <span class="shortcutTooltip">del</span>
          </span>
        </v-tooltip> -->
        <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <AlertMessageVue ref="alertMessage" class="alertMessage" type="warning" />
        <AlertMessageVue ref="successMessage" class="alertMessage" type="success" />
        <v-row justify="center">
          <v-col cols="6">
            <v-form ref="form" v-model="isValid" lazy-validation>
              <v-text-field
                label="Libellé"
                v-model="libelle"
                :readonly="readonly"
                outlined
                maxlength="3"
                ref="deviseLabel"
                autofocus
              />
              <v-select
                label="Type"
                v-model="typeDevise"
                :items="typeItems"
                item-text="label"
                item-value="value"
                :readonly="readonly"
                outlined
              ></v-select>
              <v-checkbox label="CEE" v-model="cee" :readonly="readonly" />
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-tooltip top open-delay="500">
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
              @click="saveDevise()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder la devise
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { DeviseMaintenance } from '@/models/Devise/DeviseMaintenance';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import DeviseApi from '@/api/DeviseApi';

@Component({
  name: 'DeviseVue',
  components: { AlertMessageVue }
})
export default class DeviseVue extends Vue {
  @Ref() readonly deviseLabel: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;

  @Ref() paiementField!: any;
  @Ref() DeviseDialog!: any;

  private display = false;
  private isValid = true;

  private resolve: any;
  private reject: any;
  private reloadOnClose = false;

  private saveLoading = false;
  private deleteLoading = false;
  private getLoading = false;

  get isLoading() {
    return this.saveLoading || this.deleteLoading || this.getLoading;
  }

  private devise: DeviseMaintenance = new DeviseMaintenance();
  private deviseBase: DeviseMaintenance = new DeviseMaintenance(); // Used for the reset method

  /// Devise model
  private id = 0;
  private libelle = '';
  private typeDevise = '';
  private cee = false;

  private rules = DeviseMaintenance.rules;

  private readonly = true;
  private newRecord = false;

  private typeItems = [
    { label: 'Décimal', value: 'D' },
    { label: 'Entier', value: 'E' }
  ];

  public open(devise: DeviseMaintenance): Promise<boolean> {
    this.readonly = true;
    this.devise = new DeviseMaintenance();
    this.deviseBase = devise;

    this.setDevise(devise);

    this.display = true;
    this.newRecord = false;
    this.reloadOnClose = false;

    this.$nextTick(() => {
      (this.deviseLabel as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public async openNew(): Promise<number> {
    this.readonly = false;
    this.setDevise(new DeviseMaintenance());
    this.deviseBase = new DeviseMaintenance();
    this.newRecord = true;

    this.display = true;
    this.$nextTick(() => {
      (this.deviseLabel as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setDevise(devise: DeviseMaintenance) {
    this.id = devise.id;
    this.libelle = devise.libelle;
    this.typeDevise = devise.typeDevise;
    this.cee = devise.cee;
  }

  private mapDevise() {
    this.devise.id = this.id;
    this.devise.libelle = this.libelle;
    this.devise.typeDevise = this.typeDevise;
    this.devise.cee = this.cee;
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setDevise(new DeviseMaintenance());
    this.reject();
  }

  private async loadDevise(id: number) {
    this.getLoading = true;

    const devise = await DeviseApi.getDeviseById(id);

    this.setDevise(devise);
    this.deviseBase = devise;

    this.getLoading = false;
  }

  private modifierDevise() {
    if (!this.getLoading) {
      this.readonly = false;
      this.$nextTick(() => this.deviseLabel.focus());
    }
  }

  private deleteDevise() {
    console.log('delete');
  }

  private async saveDevise() {
    (this.$refs.form as any).validate();
    if (!this.isValid) return false;

    this.saveLoading = true;

    this.mapDevise();

    if (this.newRecord) {
      await DeviseApi.createDevise(this.devise)
        .then(() => {
          this.devise = this.deviseBase;
          this.closeDialog();
        })
        .catch((err) => {
          this.alertMessage.show('Une erreur est survenue lors de la sauvegarde du Devise', displayAxiosError(err));
          this.readonly = false;
        })
        .finally(() => {
          this.saveLoading = false;
        });
    } else {
      await DeviseApi.updateDevise(this.devise, this.deviseBase.hash)
        .then(() => {
          this.readonly = true;
          this.successMessage.show('La devise a été mis à jour avec succès.', '');
          this.resolve(true);
        })
        .finally(() => (this.saveLoading = false));
    }
  }

  private cancelEdit() {
    this.devise = this.deviseBase;
    if (this.newRecord) {
      this.closeDialog();
    } else {
      this.readonly = true;
    }
  }

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }
}
</script>

<style scoped>
.v-dialog {
  max-width: 60% !important;
}
</style>
