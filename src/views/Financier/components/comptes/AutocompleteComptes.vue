<template>
  <span>
    <v-combobox
      ref="comboboxCompte"
      label="N° compte"
      v-model="numeroCompteSelected"
      :items="comptesSearch"
      :search-input.sync="searchCompte"
      :rules="numeroCompteRules"
      @keyup.enter="$event.target.select()"
      @focus="$event.target.select()"
      @change="numeroCompteChangeAsync"
      @keydown.ctrl.f.prevent="openSearchCompte()"
      :hide-details="readonly"
      :filled="readonly"
      :readonly="readonly"
      validate-on-blur
      hide-selected
      item-text="numeroNom"
      item-value="numero"
      hide-no-data
      dense
    >
      <template v-slot:append>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-show="!readonly"
              :disabled="readonly"
              @click="openSearchCompte()"
              @keydown.enter.prevent.stop="openSearchCompte()"
              tabindex="4"
              v-on="on"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <span>Recherche de compte <span class="shortcutTooltip">ctrl + f</span></span>
        </v-tooltip>
      </template>
      <template v-slot:selection="{ item }">
        {{ item.numero }}
      </template>
      <template v-slot:item="{ item }">
        {{ item.numeroNom }}
      </template>
    </v-combobox>
    <SearchCompteTierVue ref="searchCompteTierDialog"></SearchCompteTierVue>
    <SearchCompteGeneralVue ref="searchCompteGeneralDialog"></SearchCompteGeneralVue>
  </span>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import SearchCompteTierVue from './SearchCompteTier.vue';
import SearchCompteGeneralVue from './SearchCompteGeneral.vue';
import CompteApi from '@/api/CompteApi';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';

@Component({
  name: 'AutocompleteComptes',
  components: { SearchCompteTierVue, SearchCompteGeneralVue }
})
export default class extends Vue {
  @Ref() readonly comboboxCompte!: HTMLInputElement;
  @Ref() readonly searchCompteTierDialog!: SearchCompteTierVue;
  @Ref() readonly searchCompteGeneralDialog!: SearchCompteGeneralVue;

  @PropSync('Readonly')
  private readonly!: boolean;
  @PropSync('TypeCompte')
  private typeCompte!: string;
  private compteLoading = false;

  private numeroCompte = '';
  private numeroCompteRules: any = [(v: string) => !!v || 'Numéro obligatoire'];
  private comptesSearch: { numero: string | number; numeroNom: string }[] = [];
  private searchCompte = '';
  private numeroCompteSelected: { numero: string | number; nom: string; numeroNom: string } = {
    numero: '',
    nom: '',
    numeroNom: ''
  };
  private nomCompte = '';
  private natureCompte = '';

  public init(numero: string, nom: string) {
    if (numero && numero != '0') {
      const compteToSelect = {
        numero: numero ? numero : '',
        nom,
        numeroNom: `${nom} ${nom}`
      };
      this.comptesSearch = [];
      this.comptesSearch.push(compteToSelect);
      this.numeroCompteSelected = compteToSelect;
      this.numeroCompte = numero.toString();
    }
  }

  //#region Compte
  private async numeroCompteChangeAsync(
    value: string | { numero: string | number; nom: string; numeroNom: string } | undefined
  ) {
    if (!value)
      //Si vide
      this.resetCompte();
    else if (typeof value === 'string') {
      //Si on tappe un numéro sans passer pour l'aucomplete
      if (value.isInt() && value.length == 8 && (this.typeCompte == 'C' || this.typeCompte == 'F'))
        this.$emit('Change', value);
      else {
        await this.loadCompteByString(value);
      }
    } //Si on sélectionne via autocomplete
    else {
      if (this.typeCompte == 'F' || this.typeCompte == 'C') {
        this.setCompte(value);
        this.natureCompte = '';
        this.$emit('Change', value);
      } else {
        const compte = await CompteApi.getCompteGeneral(this.typeCompte, this.numeroCompteSelected.numero.toString());
        this.setCompteGeneral(compte);
        this.$emit('Change', value);
      }
    }
  }

  private async loadCompteByString(value: string) {
    try {
      this.compteLoading = true;
    } catch {
      if (value) {
        if (this.typeCompte == 'F' || this.typeCompte == 'C') {
          const compte = await CompteApi.getCompteDeTier(this.typeCompte, value);
          this.setCompte(compte);
          this.$emit('Change', compte);
        } else {
          const compte = await CompteApi.getCompteGeneral(this.typeCompte, value);
          this.setCompteGeneral(compte);
          this.$emit('Change', compte);
        }
      } else {
        this.numeroCompte = '';
        this.nomCompte = '';
      }
    } finally {
      this.compteLoading = false;
    }
  }

  @Watch('searchCompte')
  private async autocompleteCompte(matchCode: string) {
    try {
      this.compteLoading = true;
      if (matchCode && matchCode.isInt() && this.typeCompte == 'G') {
        this.comptesSearch = await CompteApi.autocompleteCompteByNumero(this.typeCompte, matchCode, 5);
      } else if (matchCode) {
        if (this.typeCompte == 'F' || this.typeCompte == 'C')
          this.comptesSearch = await CompteApi.searchCompteDeTier(this.typeCompte, matchCode.toUpperCase(), 5);
        else
          this.comptesSearch = await CompteApi.autocompleteCompteByMatchCode(
            this.typeCompte,
            matchCode.toUpperCase(),
            5
          );
      } else this.comptesSearch = [];
    } catch (err) {
      console.log(err);
    } finally {
      this.compteLoading = false;
    }
  }

  private openSearchCompte(): void {
    if (this.typeCompte) {
      this.comboboxCompte.blur();
      if (this.typeCompte == 'G' || this.typeCompte == 'Z') this.openSearchCompteGeneral();
      else this.openSearchCompteTier();
    }
  }

  private openSearchCompteGeneral() {
    if (this.typeCompte) {
      this.comboboxCompte.blur();
      this.searchCompteGeneralDialog
        .open(this.typeCompte)
        .then((compte) => {
          this.setCompte(compte);
          this.$emit('Change', compte);
        })
        .catch(() => {
          this.$nextTick(() => this.comboboxCompte?.focus());
        });
    }
  }

  private openSearchCompteTier(): void {
    if (this.typeCompte) {
      this.comboboxCompte.blur();
      this.searchCompteTierDialog
        .open(this.typeCompte)
        .then((compte) => {
          this.setCompte(compte);
          this.$emit('Change', compte);
        })
        .catch(() => {
          this.$nextTick(() => this.comboboxCompte?.focus());
        });
    }
  }

  private setCompteGeneral(compteGeneral: CompteGeneralSearch) {
    this.natureCompte = compteGeneral.nature;
    this.setCompte(compteGeneral);
  }

  private setCompte(compte: { numero: number | string; nom: string; numeroNom: string }) {
    if (compte) {
      this.comptesSearch = [];
      this.comptesSearch.push(compte);
      this.numeroCompteSelected = compte;
    }

    this.numeroCompte = compte.numero.toString();
    this.nomCompte = compte.nom;
  }

  public focus() {
    this.$nextTick(() => this.comboboxCompte?.focus());
  }

  public blur() {
    this.$nextTick(() => this.comboboxCompte?.blur());
  }

  @Watch('typeCompte')
  public resetCompte() {
    this.numeroCompteSelected = { numero: '', nom: '', numeroNom: '' };
    this.searchCompte = '';
    this.numeroCompte = '';
    this.nomCompte = '';
    this.natureCompte = '';
  }
}
</script>
