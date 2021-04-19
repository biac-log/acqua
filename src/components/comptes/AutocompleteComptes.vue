<template>
  <div class="autocompleteCompte">
    <v-combobox
      ref="comboboxCompte"
      :label="label"
      v-model="numeroCompteSelected"
      :items="comptesSearch"
      :search-input.sync="searchCompte"
      :rules="bindedRules"
      @keyup.enter="$event.target.select()"
      @focus="$event.target.select()"
      @change="numeroCompteChangeAsync"
      @keydown.ctrl.f.prevent="openSearchCompte()"
      :hide-details="hideDetails && isReadonly"
      :readonly="isReadonly"
      :loading="compteLoading || autocompleteLoading"
      :error-messages="errorCompte"
      validate-on-blur
      no-filter
      item-value="numero"
      :item-text="castNumero"
      hide-no-data
      :dense="isDense"
      :tabIndex="_tabIndex"
      :error.sync="error"
      :suffix="nomCompte"
      :outlined="outlined"
      auto-select-first
    >
      <template v-slot:append>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-show="!isReadonly"
              :disabled="isReadonly"
              @click="openSearchCompte()"
              @keydown.enter.prevent.stop="openSearchCompte()"
              tabindex="-1"
              v-on="on"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <span>Recherche de compte <span class="shortcutTooltip">ctrl + f</span></span>
        </v-tooltip>
      </template>
      <template v-slot:item="{ item }"> {{ item.numero ? item.numero : '' }} {{ item.nom }}</template>
    </v-combobox>
    <SearchCompteTierVue ref="searchCompteTierDialog"></SearchCompteTierVue>
    <SearchCompteGeneralVue ref="searchCompteGeneralDialog"></SearchCompteGeneralVue>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref, Prop } from 'vue-property-decorator';
import SearchCompteTierVue from './SearchCompteTier.vue';
import SearchCompteGeneralVue from './SearchCompteGeneral.vue';
import CompteApi from '@/api/CompteApi';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';

@Component({
  name: 'AutocompleteComptes',
  components: { SearchCompteTierVue, SearchCompteGeneralVue },
})
export default class AutocompleteComptes extends Vue {
  @Ref() readonly comboboxCompte!: HTMLInputElement;
  @Ref() readonly searchCompteTierDialog!: SearchCompteTierVue;
  @Ref() readonly searchCompteGeneralDialog!: SearchCompteGeneralVue;

  @PropSync('readonly') private isReadonly!: boolean;
  @PropSync('typeCompte') private _typeCompte!: string;
  @PropSync('dense', { default: false }) private isDense!: boolean;
  @PropSync('rules', { default: null }) private bindedRules!: any | null;
  @Prop({ default: 'N° Compte' }) readonly label!: string;
  @Prop({ default: true }) hideDetails!: boolean;
  @Prop() outlined!: boolean;
  @PropSync('tabindex', { default: undefined }) _tabIndex!: number;
  private compteLoading = false;
  private autocompleteLoading = false;
  private comptesSearch: { numero: string | number; nom: string }[] = [];
  private searchCompte = '';
  private numeroCompteSelected: { numero: string | number; nom: string } | null = null;
  private nomCompte = '';
  private errorCompte = '';
  private error = false;
  private castNumero(item: { numero: number }) {
    //Car search-input doit être un string
    return item.numero != 0 ? item.numero.toString() : '';
  }

  private initialisation = false;
  public init(numero: string, nom: string) {
    this.initialisation = true;
    if (numero) {
      const compteToSelect = {
        numero: numero ? numero : '',
        nom,
        numeroNom: numero ? `${numero} ${nom}` : '',
        bloque: false,
      };
      this.setCompte(compteToSelect);
    } else this.resetCompte();
    this.initialisation = false;
  }

  //#region Compte
  private async numeroCompteChangeAsync(
    value: string | { numero: string | number; nom: string; bloque: boolean } | undefined | null
  ) {
    this.errorCompte = '';
    if (!value)
      //Si vide
      this.resetCompte();
    else if (typeof value === 'string') {
      //Si on tappe un numéro sans passer pour l'aucomplete
      if (value.isInt() && value.length == 8 && (this._typeCompte == 'C' || this._typeCompte == 'F'))
        //Si on entre un numero de facture
        this.emitChange(value);
      else {
        await this.loadCompteByString(value);
      }
    } //Si on sélectionne via autocomplete
    else {
      if (this._typeCompte == 'F' || this._typeCompte == 'C') {
        this.setCompte(value);
        this.emitChange(value);
      } else {
        if (this.numeroCompteSelected) {
          const compte = await CompteApi.getCompteGeneral(
            this._typeCompte,
            this.numeroCompteSelected.numero.toString()
          );
          this.setCompteGeneral(compte);
        }
        this.emitChange(value);
      }
    }
  }

  private async loadCompteByString(value: string) {
    try {
      this.errorCompte = '';
      if (value) {
        this.compteLoading = true;
        if (this._typeCompte == 'F' || this._typeCompte == 'C') {
          let compte;
          if (value.isInt()) {
            compte = await CompteApi.getCompteDeTier(this._typeCompte, value);
          } else {
            const comptes = await CompteApi.searchCompteDeTier(this._typeCompte, value.toUpperCase(), 1);
            compte = comptes[0];
          }
          this.setCompte(compte);
          this.emitChange(compte);
        } else {
          const compte = await CompteApi.getCompteGeneral(this._typeCompte, value);
          this.setCompteGeneral(compte);
          this.emitChange(compte);
        }
      }
    } catch (err) {
      this.errorCompte = `Compte ${value} invalide.`;
      this.emitChange('');
    } finally {
      this.compteLoading = false;
    }
  }

  @Watch('searchCompte')
  private async autocompleteCompte(matchCode: string) {
    if (!matchCode || matchCode.toString().length == 9) return;
    try {
      this.autocompleteLoading = true;
      if (matchCode && matchCode.isInt() && this._typeCompte == 'G') {
        this.comptesSearch = await CompteApi.autocompleteCompteByNumero(this._typeCompte, matchCode, 10);
      } else if (matchCode) {
        if (this._typeCompte == 'F' || this._typeCompte == 'C') {
          this.comptesSearch = await CompteApi.searchCompteDeTier(this._typeCompte, matchCode.toUpperCase(), 5);
        } else {
          this.comptesSearch = await CompteApi.autocompleteCompteByMatchCode(
            this._typeCompte,
            matchCode.toUpperCase(),
            5
          );
        }
      } else this.comptesSearch = [];
    } catch (err) {
      console.log(err);
    } finally {
      this.autocompleteLoading = false;
    }
  }

  private openSearchCompte(): void {
    if (this._typeCompte) {
      this.comboboxCompte.blur();
      this.errorCompte = '';
      if (this._typeCompte == 'G' || this._typeCompte == 'Z') this.openSearchCompteGeneral();
      else this.openSearchCompteTier();
    }
  }

  private openSearchCompteGeneral() {
    if (this._typeCompte) {
      this.comboboxCompte.blur();
      this.searchCompteGeneralDialog
        .open(this._typeCompte, this.searchCompte)
        .then((compte) => {
          this.setCompte(compte);
          this.emitChange(compte);
        })
        .catch(() => {
          this.$nextTick(() => this.comboboxCompte?.focus());
        });
    }
  }

  private openSearchCompteTier(): void {
    if (this._typeCompte) {
      this.comboboxCompte.blur();
      this.searchCompteTierDialog
        .open(this._typeCompte, this.searchCompte)
        .then((compte) => {
          this.setCompte(compte);
          this.emitChange(compte);
        })
        .catch(() => {
          this.$nextTick(() => this.comboboxCompte?.focus());
        });
    }
  }

  private setCompteGeneral(compteGeneral: CompteGeneralSearch) {
    this.setCompte(compteGeneral);
  }

  private setCompte(compte: { numero: number | string; nom: string; bloque: boolean }) {
    if (compte) {
      this.comptesSearch = [];
      this.comptesSearch.push(compte);
      this.numeroCompteSelected = compte;
      this.nomCompte = compte.nom;
      this.error = false;
      (this.comboboxCompte as any).errorBucket = [];
      if (compte.bloque) {
        this.error = true;
        this.errorCompte = 'Compte bloqué';
      } else {
        this.blur();
        this.emitChange(compte);
      }
    }
  }

  public focus() {
    this.$nextTick(() => this.comboboxCompte?.focus());
  }

  public blur() {
    this.$nextTick(() => this.comboboxCompte?.blur());
  }

  public emitChange(value: any) {
    if (!this.initialisation) this.$emit('change', value);
  }

  public resetCompte() {
    this.numeroCompteSelected = null;
    this.nomCompte = '';
    this.errorCompte = '';
    this.emitChange('');
  }
}
</script>
