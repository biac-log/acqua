<template>
  <v-dialog
    v-model="display"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierModel"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveModel()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="societeDialog"
    max-width="20%"
    eager
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouvelle société' : name }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn class="mr-2" color="success" :disabled="isLoading" @click="modifierModel" v-on="on">
              <v-icon left>mdi-pencil</v-icon>Modifier
            </v-btn>
          </template>
          <span>
            Modifier la société
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
        <v-btn ref="buttonClose" class="ml-5" icon color="white" @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <AlertMessageVue ref="alertMessage" class="alertMessage" type="warning" />
        <AlertMessageVue ref="successMessage" class="alertMessage" type="success" />
        <v-form ref="form" v-model="isValid" lazy-validation class="pt-2">
          <v-text-field
            outlined
            v-model="name"
            label="Nom"
            @change="initIdentifiant"
            :readonly="readonly"
            required
            :rules="rules.name"
          />
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }"
              ><v-text-field
                outlined
                v-model="identifiant"
                label="Identifiant"
                :readonly="readonly"
                v-on="on"
                required
                @blur="checkSocieteExists"
                :error-messages="identifiantErrors"
                :rules="rules.identifiant"
            /></template>
            <span
              >Cet identifiant servira pour le nom du dossier contenant les fichiers ainsi que le nom de la base de
              données.</span
            ></v-tooltip
          >
          <!--<v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }"
              >--><v-text-field
            outlined
            v-model="apolloInstanceName"
            label="Nom de l'instance"
            :readonly="readonly"
            required
            :rules="rules.instanceName"
          /><!--</template>
            <span></span
          ></v-tooltip>-->
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }"
              ><v-text-field outlined v-model="pathApollo" label="Dossier Apollo" readonly v-on="on" />
            </template>
            <span>Emplacement où les fichiers seront stockés.</span></v-tooltip
          >
          <v-text-field outlined v-model="dbName" label="Base de données" readonly />
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
            Sauvegarder la société
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch } from 'vue-property-decorator';
import { Societe } from '@/models/Societe/societe';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import SocieteApi from '@/api/SocietesApi';
import { DateTime } from '@/models/DateTime';
import { Devise } from '@/models/Financier';
import DeviseApi from '@/api/DeviseApi';
import DatePicker from '@/components/DatePicker.vue';
import { ApplicationModule } from '@/store/modules/application';
import { SocieteModule } from '@/store/modules/companies';

@Component({
  name: 'SocieteVue',
  components: { AlertMessageVue, DatePicker },
})
export default class SocieteVue extends Vue {
  @Ref() readonly societeLabel: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;

  @Ref() societeDialog!: any;

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

  private societe: Societe = new Societe();
  private societeBase: Societe = new Societe(); // Used for the reset method

  /// Societe model
  private id = 0;
  private name = '';
  private identifiant = '';
  private pathApollo = '';
  private dbName = '';
  private apolloInstanceName = '';

  private rules = Societe.rules;
  private identifiantErrors: string[] = [];

  private readonly = true;
  private newRecord = false;

  public open(societe: Societe): Promise<boolean> {
    this.readonly = true;
    this.societe = new Societe();
    this.societeBase = societe;

    this.setModel(societe);

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

  public async openNew(): Promise<boolean> {
    this.readonly = false;
    this.setModel(new Societe());
    this.societeBase = new Societe();
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

  private setModel(societe: Societe) {
    this.id = societe.id;
    this.name = societe.name;
    this.identifiant = societe.identifiant;
    this.apolloInstanceName = societe.apolloInstanceName;
    this.pathApollo = ApplicationModule.parametre.pathApolloPlaceholder.replace('\\{path}', `\\${societe.identifiant}`);
    this.dbName = `AcQuaCoreDB-${societe.identifiant}`;
  }

  private mapModel() {
    this.societe.name = this.name;
    this.societe.identifiant = this.identifiant;
    this.societe.apolloInstanceName = this.apolloInstanceName;
    this.societe.id = this.id;
    this.societe.hash = this.societeBase.hash;
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setModel(new Societe());
    this.pathApollo = '';
    this.dbName = '';
    this.identifiantErrors = [];
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
      await SocieteApi.createSociete(this.societe)
        .then(() => {
          if(SocieteModule.societes.length <= 0) {
            SocieteModule.selectSociete(this.societe);
          }
          SocieteModule.fetchSocietes();
          this.societe = this.societeBase;
          this.closeDialog();
        })
        .catch((err) => {
          this.alertMessage.show('Une erreur est survenue lors de la sauvegarde de la société', displayAxiosError(err));
          this.readonly = false;
        })
        .finally(() => {
          this.saveLoading = false;
        });
    } else {
        await SocieteApi.updateSociete(this.societe, this.societeBase.hash)
          .then(() => {
            this.readonly = true;
            this.successMessage.show('La société a été mise à jour avec succès.', '');
            this.resolve(true);
          })
          .finally(() => (this.saveLoading = false));
    }
  }

  private cancelEdit() {
    this.societe = this.societeBase;
    if (this.newRecord) {
      this.closeDialog();
    } else {
      this.setModel(this.societeBase);
      this.readonly = true;
    }
  }

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }

  @Watch('identifiant')
  private buildPaths() {
    this.pathApollo = ApplicationModule.parametre.pathApolloPlaceholder.replace('\\{path}', `\\${this.identifiant}`);
    this.dbName = `AcQuaCoreDB-${this.identifiant}`;
  }

  private async checkSocieteExists() {
    if (this.identifiant != '') {
      const exists = await SocieteApi.checkSocieteExiste(this.identifiant);

      if (exists) {
        this.identifiantErrors.push('Cet identifiant est déjà utilisé');
        // (this.$refs.numeroInput as HTMLElement).focus();
      } else {
        this.identifiantErrors = [];
        // (this.$refs.raisonInput as HTMLElement).focus();
      }
    }
  }

  private initIdentifiant(){
    if(this.newRecord) this.identifiant = this.name.toSlug()
  }
}
</script>

<style scoped>
.v-dialog {
  max-width: 60% !important;
}
</style>
