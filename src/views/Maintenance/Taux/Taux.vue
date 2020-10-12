<template>
  <v-dialog
    v-model="display"
    @click:outside="closeDialog"
    @keydown.f2.stop="modifierTaux"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveTaux()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="tauxDialog"
    max-width="20%"
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouveau taux' : `${base} vers ${code}` }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn class="mr-5" color="success" :disabled="isLoading" @click="modifierTaux" v-on="on">
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
        <v-form ref="form" v-model="isValid" lazy-validation>
          <v-row justify="center" dense>
            <v-col cols="6">
              <v-select
                label="Base"
                v-model="base"
                :items="devises"
                item-text="libelle"
                item-value="code"
                :readonly="readonly"
                :filled="readonly"
                autofocus
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                label="Code"
                v-model="code"
                :items="devises"
                item-text="libelle"
                item-value="code"
                :readonly="readonly"
                :filled="readonly"
              ></v-select>
            </v-col>
            <v-col cols="12"
              ><date-picker
                id="date"
                label="Date"
                :date.sync="date"
                :readonly.sync="readonly"
                :filled="readonly"
                :rules.sync="dateRules"
                :hide-details="readonly"
            /></v-col>
            <v-col cols="6"
              ><v-text-field label="Com" v-model="com" :readonly="readonly" :filled="readonly"></v-text-field
            ></v-col>
            <v-col cols="6">
              <v-text-field label="Tar" v-model="tar" :readonly="readonly" :filled="readonly"></v-text-field>
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
              @click="saveDevise()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder le taux
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { Taux } from '@/models/Taux/Taux';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import TauxApi from '@/api/TauxApi';
import { DateTime } from '@/models/DateTime';
import { Devise } from '@/models/Financier';
import DeviseApi from '@/api/DeviseApi';
import DatePicker from '@/components/DatePicker.vue';

@Component({
  name: 'TauxVue',
  components: { AlertMessageVue, DatePicker }
})
export default class TauxVue extends Vue {
  @Ref() readonly tauxLabel: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;

  @Ref() tauxDialog!: any;

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

  private taux: Taux = new Taux();
  private tauxBase: Taux = new Taux(); // Used for the reset method

  /// Taux model
  private base = '';
  private code = '';
  private date: DateTime = new DateTime();
  private com = '';
  private tar = '';

  // private rules = DeviseMaintenance.rules;

  private devises: Devise[] = [];

  private readonly = true;
  private newRecord = false;

  private dateRules: any = [(v: string) => DateTime.isValid(v) || 'Date invalide'];

  mounted() {
    this.getDevises();
  }

  public open(taux: Taux): Promise<boolean> {
    this.readonly = true;
    this.taux = new Taux();
    this.tauxBase = taux;

    this.setTaux(taux);

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
    this.setTaux(new Taux());
    this.tauxBase = new Taux();
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

  private setTaux(taux: Taux) {
    this.base = taux.base;
    this.code = taux.code;
    this.date = taux.dateDate;
    this.com = taux.com.toIntString();
    this.tar = taux.tar.toIntString();
  }

  private mapTaux() {
    this.taux.base = this.base;
    this.taux.code = this.code;
    this.taux.dateDate = this.date;
    this.taux.com = this.com.toNumber();
    this.taux.tar = this.tar.toNumber();
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setTaux(new Taux());
    this.reject();
  }

  private async loadTaux(id: number) {
    this.getLoading = true;

    const taux = await TauxApi.getTaux();

    // this.setTaux(taux);
    // this.tauxBase = taux;

    this.getLoading = false;
  }

  private modifierDevise() {
    if (!this.getLoading) {
      this.readonly = false;
      // this.$nextTick(() => this.deviseLabel.focus());
    }
  }

  private deleteDevise() {
    console.log('delete');
  }

  private async saveDevise() {
    (this.$refs.form as any).validate();
    if (!this.isValid) return false;

    this.saveLoading = true;

    this.mapTaux();

    if (this.newRecord) {
      await TauxApi.createTaux(this.taux)
        .then(() => {
          this.taux = this.tauxBase;
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
      /* await  DeviseApi.updateDevise(this.devise, this.deviseBase)
        .then(() => {
          this.readonly = true;
          this.successMessage.show('La devise a été mis à jour avec succès.', '');
          this.resolve(true);
        })
        .finally(() => (this.saveLoading = false)); */
    }
  }

  private cancelEdit() {
    this.taux = this.tauxBase;
    if (this.newRecord) {
      this.closeDialog();
    } else {
      this.readonly = true;
    }
  }

  private async getDevises() {
    if (this.devises.length <= 1) {
      this.devises = await DeviseApi.getAllDevises();
    }
  }
}
</script>

<style scoped>
.v-dialog {
  max-width: 60% !important;
}
</style>
