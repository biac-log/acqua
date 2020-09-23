<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouveau fournisseur' : `${numero} - ${nom}` }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
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
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
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
        <AlertMessageVue ref="alertMessage" class="alertMessage" type="warning" />
        <AlertMessageVue ref="successMessage" class="alertMessage" type="success" />
        <v-row justify="center" dense class="pt-5">
          <v-col cols="3" class="pr-5">
            <v-row dense>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  :label="newRecord ? 'Numéro prédit' : 'Numéro'"
                  v-model="numero"
                  :filled="readonly"
                  readonly
                  tabindex="-1"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Raison sociale"
                  v-model="raisonSociale"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="11"
                  tabindex="2"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  :autofocus="!readonly"
                  label="Nom"
                  ref="inputNom"
                  v-model="nom"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="23"
                  tabindex="1"
                />
              </v-col>

              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Match code"
                  v-model="matchCode"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="23"
                  tabindex="2"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pr-5 pl-5">
            <v-row dense>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Adresse"
                  v-model="adresseLigne1"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="35"
                  tabindex="3"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Complément d'adresse"
                  v-model="adresseLigne2"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="35"
                  tabindex="4"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  label="Code Postal"
                  v-model="codePostal"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="8"
                  tabindex="5"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  label="Localité"
                  v-model="localité"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="30"
                  tabindex="6"
                />
              </v-col>
              <v-col cols="4" class="pb-0 pt-0">
                <v-text-field
                  label="Pays"
                  v-model="codePays"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="3"
                  tabindex="7"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pr-5 pl-5">
            <v-row dense>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Téléphone"
                  v-model="numeroTelephone"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="14"
                  tabindex="8"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Contact 1"
                  v-model="contact1"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="30"
                  tabindex="11"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Fax"
                  v-model="téléfax"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="14"
                  tabindex="9"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Contact 2"
                  v-model="contact2"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="30"
                  tabindex="12"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="GSM"
                  v-model="gsm"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="14"
                  tabindex="10"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Contact 3"
                  v-model="contact3"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="30"
                  tabindex="13"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3" class="pl-5">
            <v-row dense>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Commentaire 1"
                  v-model="commentaire1"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="20"
                  tabindex="14"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Commentaire 2"
                  v-model="commentaire2"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="20"
                  tabindex="15"
                />
              </v-col>
              <v-col cols="12" class="pb-0 pt-0">
                <v-text-field
                  label="Commentaire 3"
                  v-model="commentaire3"
                  :filled="readonly"
                  :readonly="readonly"
                  :counter="!readonly"
                  maxlength="20"
                  tabindex="16"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">
            <v-row no-gutters>
              <v-col cols="6" class="pr-2">
                <autocomplete-comptes-vue
                  :readonly="readonly"
                  TypeCompte="G"
                  label="Compte associé"
                  @Change="setCompteAssocie"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field readonly :filled="readonly" v-model="nomCompteAssocie" />
              </v-col>
              <v-col cols="6" class="pr-2">
                <autocomplete-comptes-vue
                  :readonly="readonly"
                  TypeCompte="C"
                  label="Compte maître"
                  @Change="setCompteMaitre"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field readonly :filled="readonly" v-model="nomCompteMaitre" />
              </v-col>
              <v-col cols="6" class="pr-2">
                <autocomplete-comptes-vue
                  :readonly="readonly"
                  TypeCompte="G"
                  label="Compte vente/achat"
                  @Change="setCompteVenteAchat"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field dense readonly :filled="readonly" v-model="nomCompteVenteAchat" />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row no-gutters>
              <v-col cols="6">
                <v-select
                  label="Code assujetti"
                  v-model="codeAssujetti"
                  :items="libellesAssujettis"
                  item-text="valeur"
                  item-value="code"
                  @change="checkSaisieIntra()"
                  :readonly="readonly"
                  :filled="readonly"
                />
              </v-col>
              <v-col cols="6">
                <v-checkbox :readonly="readonly" v-model="operationsTriangulaires" label="Op. triangulaires ?" />
              </v-col>
              <v-col cols="4" class="pr-2">
                <v-text-field
                  label="Code Pays"
                  v-model="codePays"
                  :filled="readonly || intraSaisieReadonly"
                  :readonly="readonly || intraSaisieReadonly"
                  :counter="!readonly"
                  maxlength="2"
                />
              </v-col>
              <v-col cols="8">
                <v-text-field
                  label="N° Intracommunautaire"
                  v-model="intraIdentification"
                  :filled="readonly || intraSaisieReadonly"
                  :readonly="readonly || intraSaisieReadonly"
                  :counter="!readonly"
                  maxlength="18"
                />
              </v-col>
              <v-col cols="6" class="pr-2">
                <v-select
                  label="Code devise"
                  :readonly="readonly"
                  :filled="readonly"
                  :items="devises"
                  item-text="libelle"
                  item-value="id"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  label="Code suivis"
                  :readonly="readonly"
                  :filled="readonly"
                  :items="codeSuivis"
                  item-text="valeur"
                  item-value="code"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="3">
            <v-row>
              <v-col cols="8">
                <v-text-field
                  label="IBAN"
                  v-model="compte"
                  :filled="readonly"
                  :readonly="readonly"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="BIC"
                  v-model="bic"
                  :filled="readonly"
                  :readonly="readonly"
                  @blur="setBic"
                  minlength="8"
                  maxlength="11"
                  :counter="!readonly"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="N° domiciliation"
                  v-model="numeroDomiciliation"
                  :filled="readonly"
                  :readonly="readonly"
                  maxlength="12"
                  :counter="!readonly"
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
              @click="saveFournisseur()"
              tabindex="17"
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
    <SearchComptes ref="compteDialog"></SearchComptes>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch } from 'vue-property-decorator';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import { Fournisseur } from '@/models/Fournisseur/Get/Fournisseur';
import { UpdateFournisseur } from '@/models/Fournisseur/UpdateFournisseur';
import { FournisseurApi } from '@/api/FournisseurApi';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import { FournisseurParams, LibelleTiers } from '@/models/Fournisseur/Get/FournisseurParams';
import SearchComptes from './SearchComptes.vue';
import CompteApi from '@/api/CompteApi';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { Devise } from '@/models/Devise/Devise';
import DeviseApi from '@/api/DeviseApi';

@Component({
  name: 'FournisseurVue',
  components: { AlertMessageVue, SearchComptes, AutocompleteComptesVue },
})
export default class FournisseurVue extends Vue {
  @Ref() readonly inputNom: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;
  @Ref() readonly autocompleteCompteAssocie!: AutocompleteComptesVue;
  @Ref() readonly autocompleteCompteMaitre!: HTMLInputElement;
  @Ref() readonly autocompleteCompteVenteAchat!: HTMLInputElement;
  @Ref() readonly compteDialog!: SearchComptes;

  private display = false;

  private resolve: any;
  private reject: any;
  private reloadOnClose = false;

  private saveLoading = false;
  private deleteLoading = false;
  private getLoading = false;

  get isLoading() {
    return this.saveLoading || this.deleteLoading || this.getLoading;
  }

  private fournisseur: Fournisseur = new Fournisseur();
  private fournisseurBase: Fournisseur = new Fournisseur(); // Used for the reset method

  /// Fournisseur model
  public numero = 0;
  public nom = '';
  public matchCode = '';
  public adresseLigne1 = '';
  public adresseLigne2 = '';
  public localité = '';
  public raisonSociale = '';
  public codePays = '';
  public codePostal = '';
  public contact1 = '';
  public contact2 = '';
  public contact3 = '';
  public numeroTelephone = '';
  public téléfax = '';
  public gsm = '';
  public commentaire1 = '';
  public commentaire2 = '';
  public commentaire3 = '';
  public compteAssocie = 0;
  public nomCompteAssocie = '';
  public compteMaitre = 0;
  public nomCompteMaitre = '';
  public compteVenteAchat = 0;
  public nomCompteVenteAchat = '';
  public codeAssujetti = 0;
  public intraCodePays = '';
  public intraIdentification = 0;
  public codeDevise = 0;
  public typeSuivis = 0;
  public compte = '';
  public banAdr = '';
  public banPays = '';
  public banVille = '';
  public banAgence = '';
  public operationsTriangulaires = false;
  public numeroDomiciliation = '';

  private readonly = true;
  private newRecord = false;

  private libellesAssujettis: LibelleTiers[] = [];
  private intraSaisieReadonly = true;

  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();

  private codeSuivis: LibelleTiers[] = [];

  public bic = ''; 

  mounted() {
    this.getDevises();
  }

  public open(searchFournisseur: SearchFournisseur): Promise<boolean> {
    const fournisseur = new Fournisseur();

    this.numero = searchFournisseur.numero;
    this.nom = searchFournisseur.nom;

    this.display = true;
    this.newRecord = false;
    this.reloadOnClose = false;

    this.loadFournisseur(searchFournisseur.numero);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public async openNew(params: FournisseurParams): Promise<number> {
    this.readonly = false;
    this.setFournisseur(new Fournisseur());
    this.fournisseurBase = new Fournisseur();
    this.newRecord = true;

    this.numero = params.nextNumero;
    this.compteAssocie = params.numeroCompteAssocieDefaut;

    this.fournisseurBase.numero = params.nextNumero;
    this.fournisseurBase.compteAssocie = params.numeroCompteAssocieDefaut;

    this.display = true;
    this.$nextTick(() => (this.inputNom as any).focus());

    if (this.libellesAssujettis.length < 1) this.libellesAssujettis = params.libellesAssujettis;
    if (this.codeSuivis.length < 1) this.codeSuivis = params.codeSuivis;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setFournisseur(fournisseur: Fournisseur) {
    this.numero = fournisseur.numero;
    this.nom = fournisseur.nom;
    this.matchCode = fournisseur.matchCode;
    this.adresseLigne1 = fournisseur.adresseLigne1;
    this.adresseLigne2 = fournisseur.adresseLigne2;
    this.localité = fournisseur.localité;
    this.raisonSociale = fournisseur.raisonSociale;
    this.codePays = fournisseur.codePays;
    this.codePostal = fournisseur.codePostal;
    this.contact1 = fournisseur.contact1;
    this.contact2 = fournisseur.contact2;
    this.contact3 = fournisseur.contact3;
    this.numeroTelephone = fournisseur.numeroTelephone;
    this.téléfax = fournisseur.téléfax;
    this.gsm = fournisseur.gsm;
    this.commentaire1 = fournisseur.commentaire1;
    this.commentaire2 = fournisseur.commentaire2;
    this.commentaire3 = fournisseur.commentaire3;
    this.compteAssocie = fournisseur.compteAssocie;
    this.compteMaitre = fournisseur.compteMaitre;
    this.compteVenteAchat = fournisseur.compteVenteAchat;
    this.codeAssujetti = fournisseur.codeAssujetti;
    this.intraCodePays = fournisseur.intraCodePays;
    this.intraIdentification = fournisseur.intraIdentification;
    this.codeDevise = fournisseur.codeDevise;
    this.compte = fournisseur.compte;
    this.banAdr = fournisseur.banAdr;
    this.banPays = fournisseur.banPays;
    this.banVille = fournisseur.banVille;
    this.banAgence = fournisseur.banAgence;
    this.typeSuivis = fournisseur.typeSuivis;
    this.operationsTriangulaires = fournisseur.operationsTriangulaires;
    this.numeroDomiciliation = fournisseur.numeroDomiciliation;
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.intraSaisieReadonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setFournisseur(new Fournisseur());
  }

  private async loadFournisseur(numero: number) {
    this.getLoading = true;

    const fournisseurDTO = await FournisseurApi.getFournisseurByNumero(numero);

    this.setFournisseur(new Fournisseur(fournisseurDTO));
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

    if (this.newRecord) {
      await FournisseurApi.createFournisseur(this.fournisseur)
        .then((numeroFournisseur) => {
          this.resolve(numeroFournisseur);
          this.fournisseur = this.fournisseurBase;
          this.closeDialog();
        })
        .catch((err) => {
          this.alertMessage.show(
            'Une erreur est survenue lors de la sauvegarde du fournisseur',
            displayAxiosError(err)
          );
          this.readonly = false;
        })
        .finally(() => {
          this.saveLoading = false;
        });
    } else {
      await FournisseurApi.updateFournisseur(new UpdateFournisseur(this.fournisseur), this.fournisseurBase)
        .then(() => {
          this.successMessage.show('Le fournisseur a été mis à jour avec succès.', '');
          this.resolve(true);
        })
        .finally(() => (this.saveLoading = false));
    }
  }

  private cancelEdit() {
    this.fournisseur = this.fournisseurBase;
    if (!this.newRecord) this.readonly = true;
  }

  private setCompteAssocie(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteAssocie = 0;
      this.nomCompteAssocie = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteGeneralSearch) {
      this.compteAssocie = compte.numero;
      this.nomCompteAssocie = compte.nom;
    }
  }

  private setCompteMaitre(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteMaitre = 0;
      this.nomCompteMaitre = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteDeTier) {
      this.compteMaitre = compte.numero;
      this.nomCompteMaitre = compte.nom;
    }
  }

  private setCompteVenteAchat(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteVenteAchat = 0;
      this.nomCompteVenteAchat = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteGeneralSearch) {
      this.compteVenteAchat = compte.numero;
      this.nomCompteVenteAchat = compte.nom;
    }
  }

  private checkSaisieIntra() {
    const libelle = this.libellesAssujettis.find((l) => l.code == this.codeAssujetti);

    if (libelle?.saisieIntra == 'Y') {
      this.intraSaisieReadonly = false;
    } else {
      this.intraSaisieReadonly = true;
    }
  }

  private async getDevises() {
    if (this.devises.length <= 1) {
      this.devises = await DeviseApi.getAllDevises();
    }
  }

  private setBic(){
    if(this.bic.length > 0) {
      this.banAdr = this.bic.substring(0,4);
      this.banPays = this.bic.substring(4,6);
      this.banVille = this.bic.substring(6,8);
      this.banAgence = this.bic.substring(8);
    }
  }
}
</script>

<style scoped></style>
