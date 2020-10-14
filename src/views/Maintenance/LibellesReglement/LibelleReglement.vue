<template>
  <v-dialog
    v-model="display"
    @click:outside="closeDialog"
    @keydown.f2.stop="modifierModel"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveModel()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="itemDialog"
    max-width="20%"
    eager
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouveau libellé' : `${numero}` }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn class="mr-5" color="success" :disabled="isLoading" @click="modifierModel" v-on="on">
              <v-icon left>mdi-pencil</v-icon>Modifier
            </v-btn>
          </template>
          <span>
            Modifier le libellé
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
              @click="deleteModel"
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
        <v-form ref="form" v-model="isValid" lazy-validation>
          <v-row justify="center" dense>
            <v-col cols="6">
              <v-text-field
                label="Numéro"
                v-model="numero"
                :readonly="readonly || !newRecord"
                :filled="readonly || !newRecord"
                :hide-details="readonly || !newRecord"
                maxlength="2"
              />
              <v-text-field
                label="Libellé"
                v-model="libelle"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
                maxlength="11"
              />
            </v-col>
          </v-row>
        </v-form>
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
              @click="saveModel()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder le libellé
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { LibelleReglement } from '@/models/LibelleReglement/LibelleReglement';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import LibelleReglementApi from '@/api/LibelleReglementApi';

@Component({
  name: 'LibelleReglementVue',
  components: { AlertMessageVue }
})
export default class LibelleReglementVue extends Vue {
  @Ref() readonly tauxLabel: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;

  @Ref() itemDialog!: any;

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

  private model: LibelleReglement = new LibelleReglement();
  private modelBase: LibelleReglement = new LibelleReglement(); // Used for the reset method

  /// LibelleReglement model
  private numero = '';
  private libelle = '';

  private rules = LibelleReglement.rules;

  private readonly = true;
  private newRecord = false;

  public open(item: LibelleReglement): Promise<boolean> {
    this.readonly = true;
    this.model = new LibelleReglement();
    this.modelBase = item;

    this.setModel(item);

    this.display = true;
    this.newRecord = false;
    this.reloadOnClose = false;

    this.$nextTick(() => {
      // (this.deviseLabel as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public async openNew(): Promise<number> {
    this.readonly = false;
    this.setModel(new LibelleReglement());
    this.modelBase = new LibelleReglement();
    this.newRecord = true;

    this.display = true;
    this.$nextTick(() => {
      // (this.deviseLabel as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setModel(model: LibelleReglement) {
    this.numero = model.numero.toIntString();
    this.libelle = model.libelle;
  }

  private mapModel() {
    this.model.numero = this.numero.toNumber();
    this.model.libelle = this.libelle;
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setModel(new LibelleReglement());
    this.reject();
  }

  private modifierModel() {
    if (!this.getLoading) {
      this.readonly = false;
      // this.$nextTick(() => this.deviseLabel.focus());
    }
  }

  private deleteModel() {
    console.log('delete');
  }

  private async saveModel() {
    (this.$refs.form as any).validate();
    if (!this.isValid) return false;

    this.saveLoading = true;

    this.mapModel();

    if (this.newRecord) {
      await LibelleReglementApi.create(this.model)
        .then(() => {
          this.model = this.modelBase;
          this.closeDialog();
        })
        .catch((err) => {
          this.alertMessage.show('Une erreur est survenue lors de la sauvegarde du Model', displayAxiosError(err));
          this.readonly = false;
        })
        .finally(() => {
          this.saveLoading = false;
        });
    } else {
      await LibelleReglementApi.update(this.model, this.modelBase)
        .then(() => {
          this.readonly = true;
          this.successMessage.show('Le libellé a été mis à jour avec succès.', '');
          this.resolve(true);
        })
        .finally(() => (this.saveLoading = false));
    }
  }

  private cancelEdit() {
    this.model = this.modelBase;
    if (this.newRecord) {
      this.closeDialog();
    } else {
      this.readonly = true;
    }
  }
}
</script>

<style scoped>
</style>
