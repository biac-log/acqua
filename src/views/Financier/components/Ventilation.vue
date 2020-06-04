<template>
  <v-dialog v-model="dialog" width="800" @keydown.enter.prevent.stop="sendVentilation" @click:outside="close()" @keydown.esc="close()">
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
              <v-text-field
                label="N° compte"
                v-model="numeroCompte"
                :filled="readonly"
                :readonly="readonly"
                :hide-details="readonly"
                ref="numeroCompte"
                @keypress.enter.prevent.stop="loadCompte"
                @blur="loadCompte"
                autofocus
              >
                <template v-slot:append>
                  <v-btn icon small :disabled="readonly" @click="OpenSearchCompte()" @keydown.enter.prevent.stop="OpenSearchCompte()">
                    <v-icon>mdi-magnify</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
              <!-- <SearchCompteVentilationVue
                ref="compteDialog"
              ></SearchCompteVentilationVue> -->
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
                validate-on-blur
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
	CaseTva
} from "@/models/AchatVente";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import { CompteApi } from "@/api/CompteApi";
//import SearchCompteVentilationVue from "./SearchCompteVentilation.vue";
import SearchCaseTvaVue from "@/components/search/SearchCaseTva.vue";
import axios, { AxiosError } from "axios";
import CompteGenerealSearch from "../../../models/Compte/CompteGeneralSearch";
import { Ventilation } from '../../../models/Financier';

@Component({
  name: "Ventilation",
  components: { SearchCaseTvaVue }
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
    (v: string) => !!v || "Case tva obligatoire",
    (v: string) => (Number.isInteger(v.toNumber()) && v.toNumber() != 0) || "Numero invalide"
  ];
  private caseTva: CaseTva = new CaseTva();

  private libelleCaseTva: string = "";
  private tauxCase: number= 0;
  private tvaLoading = false;
  private reference: string = "";
  private referenceRules: any = [(v: string) => !!v || "Référence obligatoire"];

  private tvaCalcule : number = 0;
  private tvaImpute : number = 0;
  private ventileDevise: number = 0;

  mounted() {
    AchatVenteApi.getTypesComptes().then(resp => {
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
    this.nomCompte = ventilation.nomCompte;
    this.libelle = ventilation.libelle;
    this.typesMouvementsSelected = this.typesMouvements.find(d => d.id == ventilation.codeMouvement) || this.typesMouvements[0];
    this.montant = ventilation.montantBase && this.devisesSelected ? ventilation.montantBase.toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2) : "";
    this.numeroCaseTva = ventilation.codeCaseTVA ? ventilation.codeCaseTVA.toString() : "";
    //this.caseTva.Refresh(ventilation.caseTva);
    this.libelleCaseTva = ventilation.libelleCaseTVA;

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

  private loadCompte() {
    this.compteLoading = true;
    if (this.typesComptesSelected && this.numeroCompte) {
      CompteApi.getCompteGeneral(
        this.typesComptesSelected.id,
        this.numeroCompte.toString()
      ).then(compte => {
        this.setCompte(compte);
      })
      .finally(() => {
        this.compteLoading = false;
      });
    }
  }
  private OpenSearchCompte(): void {
    // if (this.typesComptesSelected) {
    //   (this.$refs.compteDialog as SearchCompteVentilationVue)
    //     .open(this.typesComptesSelected)
    //     .then(compte => {
    //       this.setCompte(compte);
    //       this.$nextTick(() => (this.$refs.libelle as any)?.focus());
    //     }).catch(() => {
    //       this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
    //     });
    // }
  }

  private setCompte(compte: CompteGenerealSearch) {
    this.numeroCompte = compte.numero.toString();
    this.nomCompte = compte.nom;
    if(compte.numeroCase){
      AchatVenteApi.getCaseTVA(compte.numeroCase, this.numeroJournal).then((resp) => {
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
    if (+this.numeroCaseTva) {
      this.tvaLoading = true;
      AchatVenteApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal)
        .then(caseTva => {
          this.numeroCaseTva = caseTva.numeroCase.toString();
          this.caseTva = caseTva;
          this.errorMessage = "";
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
  private OpenSearchCaseTva(): void { (this.$refs.caseTvaDialog as SearchCaseTvaVue)
      // .open(this.numeroJournal)
      // .then(caseTva => {
      //   this.numeroCaseTva = caseTva.numeroCase.toString();
      //   this.caseTva = caseTva;
      //   this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
      // }).catch(() => {
      //   this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus())
      // });
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

