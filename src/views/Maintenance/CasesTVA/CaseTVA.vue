<template>
  <v-dialog
    v-model="display"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierModel"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveModel()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="itemDialog"
    max-width="25%"
    eager
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouvelle case TVA' : `${numero} - ${libelle}` }}</v-card-title>
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
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                label="Numéro"
                v-model="numero"
                readonly
                :filled="readonly"
                :hide-details="readonly"
                maxlength="3"
                required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Libellé"
                v-model="libelle"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
                maxlength="5"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-select
                label="Type case"
                v-model="typeCase"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
                :items="types"
              />
            </v-col>
            <v-col cols="8">
              <v-combobox
                label="Nature"
                v-model="natureCase"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
                :items="natures"
                item-text="text"
                item-value="value"
              >
              </v-combobox>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Code Pays"
                v-model="codePays"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
                :rules="codePaysRules"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Taux TVA"
                v-model="tauxTvaCase"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Taux égalisé"
                v-model="tauxEgalisationCase"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Taux déclaré"
                v-model="tauxNature"
                :readonly="readonly"
                :filled="readonly"
                :hide-details="readonly"
              />
            </v-col>
            <v-col cols="6"><v-checkbox hide-details label="Factures vente" :readonly="readonly" v-model="facturesVente"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="NC sur vente" :readonly="readonly" v-model="ncSurVente"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="Factures achat" :readonly="readonly" v-model="facturesAchat"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="NC sur achat" :readonly="readonly" v-model="ncSurAchat"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="Financiers" :readonly="readonly" v-model="financiers"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="O.D." :readonly="readonly" v-model="od"></v-checkbox></v-col>
            <v-col cols="6"><v-checkbox hide-details label="Intrastat" :readonly="readonly" v-model="intrastat"></v-checkbox></v-col>
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
import { CaseTvaMaintenance } from '@/models/CaseTva/CaseTvaMaintenance';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import CaseTvaApi from '@/api/CaseTvaApi';

@Component({
  name: 'CaseTvaVue',
  components: { AlertMessageVue }
})
export default class CaseTvaVue extends Vue {
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

  get keyReadonly() {
    return this.readonly || !this.newRecord;
  }

  private model: CaseTvaMaintenance = new CaseTvaMaintenance();
  private modelBase: CaseTvaMaintenance = new CaseTvaMaintenance(); // Used for the reset method

  private vatKey = '';
  private numero = '';
  private libelle = '';
  private typeCase = '';
  private tauxTvaCase = '';
  private tauxEgalisationCase = '';
  private tauxNature = '';
  private ncSurVente = false;
  private facturesAchat = false;
  private facturesVente = false;
  private ncSurAchat = false;
  private financiers = false;
  private od = false;
  private natureCase = '';
  private libelleTypeCase = '';
  private codePays = '';
  private intrastat = false;

  // private rules = LibelleReglement.rules;
  private codePaysRules = []; //TODO
  private types = CaseTvaMaintenance.types;
  private natures = CaseTvaMaintenance.natures;

  private readonly = true;
  private newRecord = false;

  public open(item: CaseTvaMaintenance): Promise<boolean> {
    this.readonly = true;
    this.model = new CaseTvaMaintenance();
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
    this.setModel(new CaseTvaMaintenance());
    this.modelBase = new CaseTvaMaintenance();
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

  private setModel(model: CaseTvaMaintenance) {
    this.vatKey = model.vatKey;
    this.numero = model.numeroCase.toIntString();
    this.libelle = model.libelleCase;
    this.typeCase = model.typeCase;
    this.tauxTvaCase = model.tauxTvaCase.toDecimalString();
    this.tauxNature = model.tauxNature.toDecimalString();
    this.tauxEgalisationCase = model.tauxEgalisationCase.toDecimalString();
    this.ncSurVente = model.ncSurVente;
    this.facturesAchat = model.facturesAchat;
    this.facturesVente = model.facturesVentes;
    this.ncSurAchat = model.ncSurAchat;
    this.financiers = model.financiers;
    this.od = model.od;
    this.natureCase = model.natureCase;
    this.libelleTypeCase = model.libelleTypeCase;
    this.codePays = model.codePays;
    this.intrastat = model.intrastat;
  }

  private mapModel() {
    this.model.vatKey = this.vatKey;
    this.model.numeroCase = this.numero.toNumber();
    this.model.libelleCase = this.libelle;
    this.model.typeCase = this.typeCase;
    this.model.tauxTvaCase = this.tauxTvaCase.toNumber();
    this.model.tauxNature = this.tauxNature.toNumber();
    this.model.tauxEgalisationCase = this.tauxEgalisationCase.toNumber();
    this.model.ncSurVente = this.ncSurVente;
    this.model.facturesAchat = this.facturesAchat;
    this.model.facturesVentes = this.facturesVente;
    this.model.ncSurAchat = this.ncSurAchat;
    this.model.financiers = this.financiers;
    this.model.od = this.od;
    this.model.natureCase = this.natureCase;
    this.model.libelleTypeCase = this.libelleTypeCase;
    this.model.codePays = this.codePays;
    this.model.intrastat = this.intrastat;
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setModel(new CaseTvaMaintenance());
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
      await CaseTvaApi.create(this.model)
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
      await CaseTvaApi.update(this.model, this.modelBase.hash)
        .then(() => {
          this.readonly = true;
          this.successMessage.show('La case TVA a été mis à jour avec succès.', '');
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

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }
}
</script>

<style scoped>
</style>
