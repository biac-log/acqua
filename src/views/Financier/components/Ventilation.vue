<template>
  <v-dialog v-model="dialog" width="900" @keydown.enter.prevent.stop="sendVentilation" @click:outside="close()" @keydown.esc="close()">
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-card-title>
          <v-col cols="12" v-if="errorMessage">
            <v-alert dense outlined type="error" class="ma-0">
              {{ errorMessage }}
            </v-alert>
          </v-col>
          <v-col cols="12">
            Ventilation
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-select
                :items="typesComptes"
                v-model="typesComptesSelected"
                label="Type compte"
                item-text="libelle"
                return-object
                :filled="readonly"
                :readonly="readonly"
                :hide-details="readonly"
                :rules="typesComptesRules"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-combobox
                  ref="numeroCompte"
                  label="N° compte"
                  v-model="numeroCompteSelected"
                  :items="comptesSearch"
                  :search-input.sync="searchCompte"
                  :rules="numeroCompteRules"
                  @keyup.enter="$event.target.select()"
                  @focus="$event.target.select()"
                  @change="numeroCompteChange"
                  :hide-details="readonly"
                  :filled="readonly"
                  :readonly="readonly"
                  validate-on-blur
                  hide-selected
                  item-text="numeroNom"
                  item-value="numero"
                  hide-no-data
                  autofocus
                >
                  <template v-slot:append>
                    <v-btn
                      icon
                      small
                      v-show="!readonly"
                      :disabled="readonly"
                      @click="OpenSearchCompte()"
                      @keydown.enter.prevent.stop="OpenSearchCompte()"
                      tabindex="4"
                    >
                      <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:selection="{ attr, on, item }">
                    {{ item.numero }}
                  </template>
                  <template v-slot:item="{ item }">
                    {{ item.numeroNom }}
                  </template>
                </v-combobox>
                <SearchCompteTierVue ref="searchCompteTierDialog"></SearchCompteTierVue>
                <SearchCompteGeneralVue ref="searchCompteGeneralDialog"></SearchCompteGeneralVue>
            </v-col>  
            <v-col cols="6">
              <v-text-field
                label="Nom compte"
                v-model="nomCompte"
                :filled="readonly"
                :hide-details="readonly"
                :rules="nomCompteRules"
                tabindex="-1"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                ref="libelle"
                label="Libelle"
                v-model="libelle"
                counter
                maxlength="23"
                :filled="readonly"
                :readonly="readonly"
                :rules="libelleRules"
                :hide-details="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-select
                :items="devises"
                v-model="devisesSelected"
                label="Devise"
                item-value="id"
                item-text="libelle"
                return-object
                :filled="readonly"
                :readonly="readonly"
                :rules="devisesRules"
                :hide-details="readonly"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Numéro case TVA"
                ref="numeroCaseTva"
                v-model="numeroCaseTva"
                :filled="readonly"
                :readonly="readonly"
                :rules="numeroCaseTvaRules"
                :hide-details="readonly"
                :loading="tvaLoading"
                @keypress.enter="loadCaseTva"
                @change="loadCaseTva"
              >
              <template v-slot:append>
                <v-btn icon small :disabled="readonly" @click="OpenSearchCaseTva()" @keydown.enter.prevent.stop="OpenSearchCaseTva()">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Libellé case TVA"
                v-model="caseTva.libelleCase"
                :filled="readonly"
                :hide-details="readonly"
                tabindex="-1"
                readonly
              ></v-text-field>
              <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-select
                :items="typesMouvements"
                v-model="typesMouvementsSelected"
                label="Type de mouvement"
                item-value="id"
                item-text="libelle"
                return-object
                :filled="readonly"
                :readonly="readonly"
                :rules="typesMouvementsRules"
                :hide-details="readonly"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                v-model="montant"
                label="Montant"
                :filled="readonly"
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
              >
                <template v-slot:append>
                  <v-btn icon small :disabled="readonly" @click="calculMontant()" @keydown.enter.prevent.stop="calculMontant()">
                    <v-icon>mdi-calculator</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="text-center">
          <v-btn
            color="error"
            class="ma-2 pr-4"
            text
            tabindex="-1"
            v-if="!isNew && !readonly"
            @click="deleteVentilation()"
            >
            Supprimer</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            class="ma-2 pr-4"
            tile outlined
            @click="dialog = false"
            tabindex="-1"
            >
            <v-icon left>mdi-close</v-icon> Fermer</v-btn
          >
          <v-btn ref="btnValidate" class="ma-2 pr-4" tile color="success" v-if="!readonly" :disabled="!isValid" @click="sendVentilation">
            <v-icon left>mdi-check</v-icon> Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop, Watch } from "vue-property-decorator";
import {
  TypeCompte,
  Devise,
  TypeMouvement,
  getTypesMouvements,
	CompteContrepartieSearch
} from "@/models/AchatVente";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import { CompteApi } from "@/api/CompteApi";
import SearchCompteTierVue from "./SearchCompteTier.vue";
import SearchCompteGeneralVue from "./SearchCompteGeneral.vue";
import SearchCaseTvaVue from "@/components/search/SearchCaseTva.vue";
import axios, { AxiosError } from "axios";
import CompteGeneralSearch from "../../../models/Compte/CompteGeneralSearch";
import { Ventilation } from '../../../models/Financier';
import { FinancierApi } from '../../../api/FinancierApi';
import { CaseTvaApi } from "@/api/CaseTvaApi";
import { CaseTva } from "@/models/CaseTva";
import { CompteDeTier } from '../../../models/Compte/CompteDeTier';
import CompteSearch from '../../../models/Compte/CompteSearch';

@Component({
  name: "Ventilation",
  components: { SearchCaseTvaVue, SearchCompteGeneralVue, SearchCompteTierVue }
})
export default class extends Vue {
  private dialog: boolean = false;
  @PropSync("isReadOnly")
  public readonly!: boolean;
  private isNew: boolean = true;
  private errorMessage: string = "";
  private isValid: boolean = true;
  private resolve!: any;
  private reject!: any;
  private numeroJournal: number = 0;

  private typesComptes: TypeCompte[] = [];
  private typesComptesSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || "Type obligatoire"];
  private compteLoading: boolean = false;
  private numeroCompte: string = "";
  private numeroCompteRules: any = [(v: string) => !!v || "Numéro obligatoire"];
  private comptesSearch: { numero: string | number; numeroNom: string }[] = [];
  private searchCompte: string = "";
  private numeroCompteSelected: { numero: string | number, nom: string, numeroNom: string } = { numero: "", nom: "", numeroNom: "" };
  private nomCompte: string = "";
  private nomCompteRules: any = [(v: string) => !!v || "Nom obligatoire"];
  private devises: Devise[] = [];
  private devisesSelected: Devise = new Devise();
  private devisesRules: any = [(v: string) => !!v || "Devise obligatoire"];
  private libelle: string = "";
  private libelleRules: any = [(v: string) => !!v || "Libelle obligatoire"];
  private typesMouvements: TypeMouvement[] = getTypesMouvements();
  private typesMouvementsSelected: TypeMouvement = new TypeMouvement();
  private typesMouvementsRules: any = [
    (v: string) => !!v || "Type obligatoire"
  ];
  private montant: string = "";
  private montantRules: any = [(v: string) => !!v || "Montant obligatoire"];
  private numeroCaseTva: string = "";
  private numeroCaseTvaRules: any = [
    (v: string) => (v.isInt() && v.toNumber() != 0) || "Numero invalide"
  ];
  private caseTva: CaseTva = new CaseTva();

  private libelleCaseTva: string = "";
  private tauxCase: number = 0;
  private tvaLoading = false;

  private reference: string = "";
  private referenceRules: any = [(v: string) => !!v || "Référence obligatoire"];

  private tvaCalcule : number = 0;
  private tvaImpute : number = 0;
  private ventileDevise: number = 0;

  mounted() {
    FinancierApi.getTypesComptes().then(resp => {
      this.typesComptes = resp;
    });
  }

  public open(
    ventilation: Ventilation,
    numeroJournal: number,
    deviseEntete: Devise
  ): Promise<Ventilation> {
    this.dialog = true;
    this.isNew = false;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(ventilation, numeroJournal, deviseEntete);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public openNew(
    numeroJournal: number,
    deviseEntete: Devise,
    ventileDevise: number,
    tvaCalcule : number,
    tvaImpute: number,
    ventilation?: Ventilation,
  ): Promise<Ventilation> {
    this.dialog = true;
    this.isNew = true;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(ventilation || new Ventilation(), numeroJournal, deviseEntete);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private init(
    ventilation: Ventilation,
    numeroJournal: number,
    deviseEntete: Devise   
  ) {
    this.initDevises(deviseEntete, ventilation);
    this.numeroJournal = numeroJournal;
    this.typesComptesSelected =this.typesComptes.find(tc => tc.id == ventilation.typeCompte) || this.typesComptes[0];
    this.devisesSelected = this.devises.find(d => d.id == ventilation.codeDevise) ||this.devises[0];
    this.numeroCompte = ventilation.numeroCompte ? ventilation.numeroCompte.toString() : "";
    
    if(ventilation){
      let compteToSelect = {
        numero: ventilation.numeroCompte ? ventilation.numeroCompte : "",
        nom: ventilation.nomCompte,
        numeroNom: `${ventilation.numeroCompte} ${ventilation.nomCompte}`
      };
      this.comptesSearch = [];
      this.comptesSearch.push(compteToSelect);
      this.numeroCompteSelected = compteToSelect;
    }

    this.nomCompte = ventilation.nomCompte;
    this.libelle = ventilation.libelle;
    this.typesMouvementsSelected = this.typesMouvements.find(d => d.id == ventilation.codeMouvement) || this.typesMouvements[0];
    this.montant = ventilation.montantBase && this.devisesSelected ? ventilation.montantBase.toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2) : "";
    this.numeroCaseTva = ventilation.codeCaseTVA ? ventilation.codeCaseTVA.toString() : "";
    this.libelleCaseTva = ventilation.libelleCaseTVA;
    
    if(this.numeroCaseTva){
      let caseTva = new CaseTva();
      caseTva.libelleCase = ventilation.libelleCaseTVA;
      caseTva.numeroCase = ventilation.codeCaseTVA;
      //TODO Remplacer par l'objet dans ventilation
      this.caseTva.Refresh(caseTva);
    }

    // this.ventileDevise = ventileDevise;
    // this.tvaCalcule = tvaCalcule;
    // this.tvaImpute = tvaImpute;
  }

  private initDevises(
    deviseEntete: Devise,
    ventilation?: Ventilation
  ) {
    this.devises = [];
    this.devises.push(new Devise({ id: 1, libelle: "EUR", typeDevise: "D" }));
    if (deviseEntete && !this.devises.find(d => d.id == deviseEntete.id))
      this.devises.push(deviseEntete);
    if (ventilation && ventilation.codeDevise != 0) {
      if(!this.devises.find(d => d.id == ventilation.codeDevise)){
        this.devises.push(
          new Devise({
            id: ventilation.codeDevise,
            libelle: ventilation.libelleDevise,
            typeDevise: this.devisesSelected.typeDevise
          })
        );
        this.devisesSelected = this.devises.find(d => d.id == ventilation.codeDevise) || this.devises[0];
      } else this.devisesSelected = this.devises[0];
    }
  }

  private numeroCompteChange(value: string | { numero: string | number, nom: string, numeroNom: string } | undefined) {
    console.log(value);
    if(!value) //Si vide
    {
      this.numeroCompte = "";
      this.nomCompte = "";
    }
    else if(typeof value === "string") //Si on tappe un numéro sans passer pour l'aucomplete
      this.loadCompteByString(value);
    else //Si on sélectionne via autocomplete
    {
      if(this.typesComptesSelected.id == "F" || this.typesComptesSelected.id == "C")
        this.setCompte(value);
      else{
        CompteApi.getCompteGeneral(this.typesComptesSelected.id, this.numeroCompteSelected.numero.toString())
          .then(compte => { 
            this.setCompte(compte); 
            this.setCompteGeneralCaseTva(compte);
          })
          .finally(() => { this.compteLoading = false; });
      }
    }
  }

  private loadCompteByString(value: string) {
    this.compteLoading = true;
    if (value) {
      if(this.typesComptesSelected.id == "F" || this.typesComptesSelected.id == "C")
      {
        CompteApi.getCompteDeTier(this.typesComptesSelected.id, value)
          .then(compte => {  this.setCompte(compte); })
          .finally(() => { this.compteLoading = false; });
      }else{
        CompteApi.getCompteGeneral(this.typesComptesSelected.id, value)
          .then(compte => { 
            this.setCompte(compte); 
            this.setCompteGeneralCaseTva(compte);
          })
          .finally(() => { this.compteLoading = false; });
      }
    }else{
      this.numeroCompte = "";
      this.nomCompte = "";
    }
  }
  
  @Watch("searchCompte")
  private async autocompleteComptes(matchCode: string) {
    try {
      this.compteLoading = true;
      if (matchCode && matchCode.isInt() && this.typesComptesSelected.id == "G") {
        this.comptesSearch = await CompteApi.autocompleteCompteByNumero(this.typesComptesSelected.id, matchCode, 5);
      } else if (matchCode) {
        if(this.typesComptesSelected.id == "F" || this.typesComptesSelected.id == "C")
          this.comptesSearch = await CompteApi.searchCompteDeTier(this.typesComptesSelected.id, matchCode.toUpperCase(), 5);
        else
          this.comptesSearch = await CompteApi.autocompleteCompteByMatchCode( this.typesComptesSelected.id, matchCode.toUpperCase(), 5);
      } else this.comptesSearch = [];
    } catch (err) {
      console.log(err);
    } finally {
      this.compteLoading = false;
    }
  }
  private OpenSearchCompte(): void {
    if (this.typesComptesSelected) {
      if(this.typesComptesSelected.id == "G" || this.typesComptesSelected.id == "Z")
        this.OpenSearchCompteGeneral();
      else  this.OpenSearchCompteTier();
    }
  }

  private OpenSearchCompteGeneral(): void {
    if (this.typesComptesSelected) {
      (this.$refs.searchCompteGeneralDialog as SearchCompteGeneralVue)
        .open(this.typesComptesSelected)
        .then(compte => {
          this.setCompte(compte);
          this.setCompteGeneralCaseTva(compte);
          this.$nextTick(() => (this.$refs.libelle as any)?.focus());
        }).catch(() => {
          this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
        });
    }
  }
  private setCompteGeneralCaseTva(compte: CompteGeneralSearch) {
    if(compte.numeroCase){
      CaseTvaApi.getCaseTVA(compte.numeroCase, this.numeroJournal).then((resp) => {
        if(resp)
        {
          this.caseTva = resp;
          this.numeroCaseTva = compte.numeroCase.toString();
        }
        else this.caseTva = new CaseTva();
        this.calculMontant();
      });
    }
  }

  private OpenSearchCompteTier(): void {
    if (this.typesComptesSelected) {
      (this.$refs.searchCompteTierDialog as SearchCompteTierVue)
        .open(this.typesComptesSelected.id)
        .then(compte => {
          this.setCompte(compte);
          this.$nextTick(() => (this.$refs.libelle as any)?.focus());
        }).catch(() => {
          this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
        });
    }
  }
  private setCompte(compte: { numero:number | string, nom: string, numeroNom: string}) {
     if (compte) {
      this.comptesSearch = [];
      this.comptesSearch.push(compte);
      this.numeroCompteSelected = compte;
    }

    this.numeroCompte = compte.numero.toString();
    this.nomCompte = compte.nom;
  }

  private calculMontant(){
    if(this.caseTva.typeCase == 50)
      this.montant = this.calculMontantTva().toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2);
    else if(this.caseTva.typeCase == 1)
      this.montant = this.calculMontantTaxable().toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2);
  }
  private calculMontantTva() : number{
    let montantTva = this.tvaCalcule - this.tvaImpute;
    if(this.typesMouvementsSelected.id == "DB") montantTva = this.tvaImpute -  this.tvaCalcule;
    if(montantTva < 0)montantTva = 0;
    return montantTva;
  }

  private calculMontantTaxable() : number {
    let montantTaxable = this.tvaCalcule - this.tvaImpute;
    if(this.typesMouvementsSelected.id == "CR")
      montantTaxable = this.ventileDevise - montantTaxable;
    else montantTaxable = montantTaxable - this.ventileDevise;

    if(montantTaxable < 0) 
      montantTaxable = 0;
    else if(this.caseTva.tauxTvaCase)
      montantTaxable = (montantTaxable / (1+ (this.caseTva.tauxTvaCase / 100)));
      
    return montantTaxable;
  }

  private loadCaseTva() {
    if (this.readonly) return;

    if (this.numeroCaseTva) {
      this.tvaLoading = true;
      this.errorMessage = "";
      CaseTvaApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal)
        .then(caseTva => {
          this.numeroCaseTva = caseTva.numeroCase.toString();
          this.caseTva = caseTva;
          this.calculMontant();
        })
        .catch((err: AxiosError) => {
          this.numeroCaseTva = "";
          this.caseTva = new CaseTva();
          if (err.request.status != 505)
            this.errorMessage = err.request.response;
        })
        .finally(() => {
          this.tvaLoading = false;
        });
    } else {
      this.caseTva.Refresh();
      this.caseTva = new CaseTva();
    }
  }

  private OpenSearchCaseTva(): void { 
    (this.$refs.caseTvaDialog as SearchCaseTvaVue).open(this.numeroJournal)
      .then(caseTva => {
        this.numeroCaseTva = caseTva.numeroCase.toString();
        this.caseTva = caseTva;
        this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
      }).catch(() => {
        this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus())
      });
  }

  private GetModel(): Ventilation {
    let ventilation = new Ventilation();
    ventilation.typeCompte = this.typesComptesSelected ? this.typesComptesSelected.id : "";
    ventilation.numeroCompte = +this.numeroCompte;
    ventilation.nomCompte = this.nomCompte;
    ventilation.libelle = this.libelle;
    ventilation.codeMouvement = this.typesMouvementsSelected ? this.typesMouvementsSelected.id : "";
    ventilation.montantDevise = this.montant.toNumber();
    ventilation.montantBase = this.montant.toNumber();
    ventilation.codeDevise = this.devisesSelected ? this.devisesSelected.id : 0;
    ventilation.libelleDevise = this.devisesSelected ? this.devisesSelected.libelle : "";
    ventilation.codeCaseTVA = this.caseTva.numeroCase;
    ventilation.libelleCaseTVA = this.caseTva.libelleCase;
    return ventilation;
  }

  private sendVentilation() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.dialog = false;
        this.resolve(this.GetModel());
      }
    })
  }

  @Watch("caseTva")
  private caseTvaChanged(val: string, oldVal: string){
    if(!this.readonly && !this.montant) this.calculMontant();
  }

  @Watch("devisesSelected")
  private deviseChanged(val: string, oldVal: string){
    if(!this.readonly && !this.montant) this.calculMontant();
  }

  private deleteVentilation() {
    this.dialog = false;
    this.resolve();
  }

  private close() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style></style>

