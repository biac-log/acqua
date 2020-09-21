<template>
  <v-dialog v-model="display" @click:outside="closeDialog">
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouveau fournisseur' : fournisseur.displayName }}</v-card-title>
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
                  v-model="fournisseur.numero"
                  :filled="readonly"
                  readonly
                  tabindex="-1"
                />
              </v-col>
              <v-col cols="6" class="pb-0 pt-0">
                <v-text-field
                  label="Raison sociale"
                  v-model="fournisseur.raisonSociale"
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
                  v-model="fournisseur.nom"
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
                  v-model="fournisseur.matchCode"
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
                  v-model="fournisseur.adresseLigne1"
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
                  v-model="fournisseur.adresseLigne2"
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
                  v-model="fournisseur.codePostal"
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
                  v-model="fournisseur.localité"
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
                  v-model="fournisseur.codePays"
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
                  v-model="fournisseur.numeroTelephone"
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
                  v-model="fournisseur.contact1"
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
                  v-model="fournisseur.téléfax"
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
                  v-model="fournisseur.contact2"
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
                  v-model="fournisseur.gsm"
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
                  v-model="fournisseur.contact3"
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
                  v-model="fournisseur.commentaire1"
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
                  v-model="fournisseur.commentaire2"
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
                  v-model="fournisseur.commentaire3"
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
                <v-combobox
                  ref="autocompleteCompteAssocie"
                  label="Compte associé"
                  v-model="compteAssocieSelected"
                  :hide-details="readonly"
                  :filled="readonly"
                  :readonly="readonly"
                  :items="compteAssocieItems"
                  :search-input.sync="searchCompteAssocie"
                  hide-selected
                  hide-no-data
                  @keydown.ctrl.f.prevent="openSearchCompte('G', 'compteAssocie')"
                  item-text="nom"
                  item-value="numero"
                  :filter="filter"
                >
                  <template v-slot:append>
                    <v-tooltip top open-delay="500" open-on-hover>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          small
                          v-show="!readonly"
                          v-on="on"
                          :disabled="readonly || saveLoading"
                          tabindex="-1"
                          @click.prevent="openSearchCompte('G', 'compteAssocie')"
                        >
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                      <span>
                        Rechercher un compte
                        <span class="shortcutTooltip">CTRL+F</span>
                      </span>
                    </v-tooltip>
                  </template>
                  <template v-slot:selection="{ item }">{{ item.numero }}</template>
                  <template v-slot:item="{ item }">{{ item.nom }}</template>
                </v-combobox>
              </v-col>
              <v-col cols="6">
                <v-text-field readonly :filled="readonly" v-model="compteAssocieSelected.nom" />
              </v-col>
              <v-col cols="6" class="pr-2">
                <v-combobox
                  ref="autocompleteCompteVenteAchat"
                  label="Compte Vente/Achat"
                  v-model="compteVenteAchatSelected"
                  :hide-details="readonly"
                  :filled="readonly"
                  :readonly="readonly"
                  :items="compteVenteAchatItems"
                  :search-input.sync="searchCompteVenteAchat"
                  hide-selected
                  hide-no-data
                  @keydown.ctrl.f.prevent="openSearchCompte('G', 'compteVenteAchat')"
                  item-text="nom"
                  item-value="numero"
                  :filter="filter"
                >
                  <template v-slot:append>
                    <v-tooltip top open-delay="500" open-on-hover>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          small
                          v-show="!readonly"
                          v-on="on"
                          :disabled="readonly || saveLoading"
                          tabindex="-1"
                          @click.prevent="openSearchCompte('G', 'compteVenteAchat')"
                        >
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                      <span>
                        Rechercher un compte
                        <span class="shortcutTooltip">CTRL+F</span>
                      </span>
                    </v-tooltip>
                  </template>
                  <template v-slot:selection="{ item }">{{ item.numero }}</template>
                  <template v-slot:item="{ item }">{{ item.nom }}</template>
                </v-combobox>
              </v-col>
              <v-col cols="6">
                <v-text-field readonly :filled="readonly" v-model="compteVenteAchatSelected.nom" />
              </v-col>
              <v-col cols="6" class="pr-2">
                <v-combobox
                  ref="autocompleteCompteMaitre"
                  label="Compte maître"
                  v-model="compteMaitreSelected"
                  :hide-details="readonly"
                  :filled="readonly"
                  :readonly="readonly"
                  :items="compteMaitreItems"
                  :search-input.sync="searchCompteMaitre"
                  hide-selected
                  hide-no-data
                  @keydown.ctrl.f.prevent="openSearchCompte('C', 'compteMaitre')"
                  item-text="nom"
                  item-value="numero"
                  :filter="filter"
                >
                  <template v-slot:append>
                    <v-tooltip top open-delay="500" open-on-hover>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          small
                          v-show="!readonly"
                          v-on="on"
                          :disabled="readonly || saveLoading"
                          tabindex="-1"
                          @click.prevent="openSearchCompte('C', 'compteMaitre')"
                        >
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                      <span>
                        Rechercher un compte
                        <span class="shortcutTooltip">CTRL+F</span>
                      </span>
                    </v-tooltip>
                  </template>
                  <template v-slot:selection="{ item }">{{ item.numero }}</template>
                  <template v-slot:item="{ item }">{{ item.nom }}</template>
                </v-combobox>
              </v-col>
              <v-col cols="6">
                <v-text-field readonly :filled="readonly" v-model="compteMaitreSelected.nom" />
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
import { FournisseurParams } from '@/models/Fournisseur/Get/FournisseurParams';
import SearchComptes from './SearchComptes.vue';
import CompteApi from '@/api/CompteApi';
import { CompteSearch } from '@/models/Compte/CompteSearch';

@Component({
  name: 'FournisseurVue',
  components: { AlertMessageVue, SearchComptes }
})
export default class FournisseurVue extends Vue {
  @Ref() readonly inputNom: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;
  @Ref() readonly autocompleteCompteAssocie!: HTMLInputElement;
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

  private readonly = true;
  private newRecord = false;

  private compteAssocieItems: { numero: number; nom: string }[] = [];
  private compteAssocieSelected: { numero: number | string; nom: string } = {
    numero: '',
    nom: ''
  };
  private searchCompteAssocie = '';
  private comptesGeneraux: CompteSearch[] = [];

  private compteMaitreItems: { numero: number; nom: string }[] = [];
  private compteMaitreSelected: { numero: number | string; nom: string } = {
    numero: '',
    nom: ''
  };
  private searchCompteMaitre = '';
  private comptesClients: CompteSearch[] = [];

  private compteVenteAchatItems: { numero: number; nom: string }[] = [];
  private compteVenteAchatSelected: { numero: number | string; nom: string } = {
    numero: '',
    nom: ''
  };
  private searchCompteVenteAchat = '';
  // No need to declare the items, they're in comptesGeneraux

  public open(searchFournisseur: SearchFournisseur): Promise<boolean> {
    const fournisseur = new Fournisseur();
    fournisseur.numero = searchFournisseur.numero;
    fournisseur.nom = searchFournisseur.nom;

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
    this.fournisseur = new Fournisseur();
    this.fournisseurBase = new Fournisseur();
    this.newRecord = true;

    this.fournisseur.numero = params.nextNumero;
    this.fournisseur.compteAssocie = params.numeroCompteAssocieDefaut;
    if (this.compteAssocieItems.length < 1)
      this.compteAssocieItems.push({ numero: params.numeroCompteAssocieDefaut, nom: params.nomCompteAssocieDefaut });
    this.compteAssocieSelected = { numero: params.numeroCompteAssocieDefaut, nom: params.nomCompteAssocieDefaut };

    this.fournisseurBase.numero = params.nextNumero;
    this.fournisseurBase.compteAssocie = params.numeroCompteAssocieDefaut;

    this.display = true;
    this.$nextTick(() => (this.inputNom as any).focus());

    await this.loadComptes();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
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

  private async loadComptes() {
    // Load the items and store them for the selection dialog
    this.comptesGeneraux = await CompteApi.searchComptesGeneraux('G');
    this.comptesClients = await CompteApi.getComptesTiers('C');

    // Map the items for the comboboxes
    this.compteAssocieItems = this.comptesGeneraux.map((c) => {
      return { numero: c.numero, nom: c.nom };
    });
    this.compteMaitreItems = this.comptesClients.map((c) => {
      return { numero: c.numero, nom: c.nom };
    });
    this.compteVenteAchatItems = this.comptesGeneraux.map((c) => {
      return { numero: c.numero, nom: c.nom };
    });
  }

  // Prevent 'is undefined' when the input is empty
  @Watch('compteAssocieSelected')
  private watchCompteAssocieSelected() {
    if (this.compteAssocieSelected == null) {
      this.compteAssocieSelected = {
        numero: '',
        nom: ''
      };
    } else {
      this.fournisseur.compteAssocie = this.compteAssocieSelected.numero as number;
    }
  }

  // Prevent 'is undefined' when the input is empty
  @Watch('compteMaitreSelected')
  private watchCompteMaitreSelected() {
    if (this.compteMaitreSelected == null) {
      this.compteMaitreSelected = {
        numero: '',
        nom: ''
      };
    } else {
      this.fournisseur.compteMaitre = this.compteMaitreSelected.numero as number;
    }
  }

  // Prevent 'is undefined' when the input is empty
  @Watch('compteVenteAchatSelected')
  private watchCompteVenteAchatSelected() {
    if (this.compteVenteAchatSelected == null) {
      this.compteVenteAchatSelected = {
        numero: '',
        nom: ''
      };
    } else {
      this.fournisseur.compteVenteAchat = this.compteVenteAchatSelected.numero as number;
    }
  }

  private filter(item: any, queryText: string, itemText: string) {
    if (item.header) return false;

    const hasValue = (val: any) => (val != null ? val : '');

    const text = hasValue(itemText);
    const query = hasValue(queryText);

    return (
      text
        .toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1
    );
  }

  private openSearchCompte(typeCompte: string, field: string) {
    if (this.readonly) return;

    let items: CompteSearch[] = []; // Items to pass to the selection dialog for the list, so we don't load them twice or more
    let callback: (value: CompteSearch) => void;
    let catchCallback: () => void;

    switch (field) {
      case 'compteAssocie':
        items = this.comptesGeneraux;
        this.autocompleteCompteAssocie.blur();
        callback = (compte: CompteSearch) => (this.compteAssocieSelected = compte);
        catchCallback = () => this.$nextTick(() => this.autocompleteCompteAssocie?.focus());
        break;
      case 'compteMaitre':
        items = this.comptesClients;
        this.autocompleteCompteMaitre.blur();
        callback = (compte: CompteSearch) => (this.compteMaitreSelected = compte);
        catchCallback = () => this.$nextTick(() => this.autocompleteCompteMaitre?.focus());
        break;
      case 'compteVenteAchat':
        items = this.comptesGeneraux;
        this.autocompleteCompteVenteAchat.blur();
        callback = (compte: CompteSearch) => (this.compteVenteAchatSelected = compte);
        catchCallback = () => this.$nextTick(() => this.autocompleteCompteVenteAchat?.focus());
        break;
      default:
        break;
    }

    this.compteDialog
      .open(typeCompte, items)
      .then((compte) => {
        callback(compte);
      })
      .catch(() => {
        catchCallback();
      });
  }
}
</script>

<style scoped>
</style>
