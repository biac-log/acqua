<template>
  <v-dialog
    v-model="dialog"
    width="1450"
    @keydown.enter.prevent.stop="sendContrepartie"
    @click:outside="close()"
    @keydown.esc="close()"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-card-title>
          <v-col cols="12" v-if="errorMessage">
            <v-alert dense outlined type="error" class="ma-0">
              {{ errorMessage }}
            </v-alert>
          </v-col>
          <v-col cols="12">
            Extrait
          </v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="typeCompte"
                label="Type compte"
                filled
                readonly
                tabindex="-1"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="N° compte"
                v-model="numeroCompte"
                tabindex="-1"
                filled
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Nom compte"
                v-model="nomCompte"
                tabindex="-1"
                filled
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-text-field
                label="Montant"
                v-model="montant"
                :filled="readonly"
                :readonly="readonly"
                autofocus
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select
                :items="reglements"
                v-model="reglementSelected"
                label="Règlement"
                item-text="libelle"
                return-object
                :filled="readonly"
                :readonly="readonly"
                :hide-details="readonly"
                :rules="reglementsRules"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Différence change"
                v-model="differenceChange"
                :filled="readonly"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-card class="ma-5">
              <v-card-title>
                Ventilations
                <v-btn
                  color="primary"
                  fab
                  small
                  class="ml-5"
                  ref="btnAdd"
                  :disabled="readonly"
                  @click.stop="createExtrait"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <VentilationVue
                  ref="refVentilationVue"
                  :isReadOnly.sync="readonly"
                ></VentilationVue>
              </v-card-title>
              <v-data-table
                :headers="headersVentilation"
                :items="ventilations"
                id="dataTable"
                class="elevation-1"
                disable-pagination
                hide-default-footer
                @click:row="editVentilation"
                disable-sort
                dense
              >
              </v-data-table>
            </v-card>
          </v-row>
        </v-card-text>
        <v-card-actions class="text-center">
          <v-btn
            color="error"
            class="ma-2 pr-4"
            text
            tabindex="-1"
            v-if="!isNew && !readonly"
            @click="deleteExtrait()"
          >
            Supprimer</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            class="ma-2 pr-4"
            tile
            outlined
            @click="dialog = false"
            tabindex="-1"
          >
            <v-icon left>mdi-close</v-icon> Fermer</v-btn
          >
          <v-btn
            ref="btnValidate"
            class="ma-2 pr-4"
            tile
            color="success"
            v-if="!readonly"
            :disabled="!isValid"
            @click="sendExtrait"
          >
            <v-icon left>mdi-check</v-icon> Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  PropSync,
  Emit,
  Prop,
  Watch
} from "vue-property-decorator";
import { Devise, Extrait, Ventilation } from "@/models/Financier";
import { FinancierApi } from "@/api/FinancierApi";
import { CompteApi } from "@/api/CompteApi";
import axios, { AxiosError } from "axios";
import CompteGenerealSearch from "@/models/Compte/CompteGeneralSearch";
import { TypeCompte } from "@/models/AchatVente";
import VentilationVue from "./Ventilation.vue";
import { Reglement } from '@/models/Financier/Get/Reglement';

@Component({
  name: "Extrait",
  components: { VentilationVue }
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

  private typeCompte: string = "";
  private compteLoading: boolean = false;
  private numeroCompte: string = "";
  private nomCompte: string = "";

  private reglementsLoading = false;
  private reglements: Reglement[] = [];
  private reglementSelected: Reglement = new Reglement();
  private reglementsRules = [(v: string) => !!v || "Règlement obligatoire"];

  private montant = "";
  private reglement = "";
  private differenceChange = "";

  private ventilations: Ventilation[] = [];
  private headersVentilation = [
    { text: "Ven", value: "", width: 50 },
    { text: "Compte", value: "libelleCompte", width: 300 },
    { text: "Intitulé", value: "nomCompte", width: 300 },
    { text: "Pièce", value: "", width: 100 },
    { text: "Libellé d'écriture", value: "", width: 300 },
    { text: "Débit", value: "montantDebit", width: 100 },
    { text: "Crédit", value: "montantCredit", width: 100 },
    { text: "", value: "libelleDevise", width: 80 },
    { text: "TVA", value: "tva", width: 50 }
  ];

  mounted(){
    this.loadReglements();
  }

  public open(extrait: Extrait): Promise<Extrait> {
    this.dialog = true;
    this.isNew = false;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(extrait);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  public openNew(): Promise<Extrait> {
    this.dialog = true;
    this.isNew = true;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      //this.init(contrepartie || new PieceComptableContrepartie(), numeroJournal, deviseEntete, ventileDevise, tvaCalcule, tvaImpute);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private editVentilation(ventilation: Ventilation) {
    let devise = new Devise({id: ventilation.codeDevise, libelle: ventilation.libelleDevise, typeDevise: "D"});
    (this.$refs.refVentilationVue as VentilationVue).open(ventilation, this.numeroJournal, devise)
    .then(() => {

    }).catch(() => {

    });
  }

  private init(extrait: Extrait) {
    this.typeCompte = extrait.typeCompte;
    this.numeroCompte = extrait.numeroCompte.toString();
    this.nomCompte = extrait.nomCompte;
    this.ventilations = extrait.ventilations;
    this.montant = extrait.montantBaseSigned;
    this.setReglement(extrait.libelleReglement);
    // this.initDevises(deviseEntete, contrepartie);
    // this.numeroJournal = numeroJournal;
  }

  private async setReglement(libelleReglement: string){
    if(!this.reglements)
      await this.loadReglements();
    
    let reglementSelected = this.reglements.find(r => r.libelle == libelleReglement);
    if(reglementSelected)
      this.reglementSelected = reglementSelected;
    else
      this.reglementSelected = new Reglement({numero: 999, libelle: libelleReglement});
  }

  private async loadReglements(){
    try {
      this.reglementsLoading = true;
      this.reglements = await FinancierApi.getReglements();
    }finally{
      this.reglementsLoading = false;
    }
  }

  private initDevises(deviseEntete: Devise, extrait?: Extrait) {
    // this.devises = [];
    // this.devises.push(new Devise({ id: 1, libelle: "EUR", typeDevise: "D" }));
    // if (deviseEntete && !this.devises.find(d => d.id == deviseEntete.id))
    //   this.devises.push(deviseEntete);
    // if (contrepartie && contrepartie.codeDevise != 0) {
    //   if(!this.devises.find(d => d.id == contrepartie.codeDevise)){
    //     this.devises.push(
    //       new Devise({
    //         id: contrepartie.codeDevise,
    //         libelle: contrepartie.libelleDevise,
    //         typeDevise: this.devisesSelected.typeDevise
    //       })
    //     );
    //     this.devisesSelected = this.devises.find(d => d.id == contrepartie.codeDevise) || this.devises[0];
    //   } else this.devisesSelected = this.devises[0];
    // }
  }

  private calculMontant() {
    // if(this.caseTva.typeCase == 50)
    //   this.montant = this.calculMontantTva().toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2);
    // else if(this.caseTva.typeCase == 1)
    //   this.montant = this.calculMontantTaxable().toDecimalString(this.devisesSelected.typeDevise == "E" ? 0 : 2);
  }
  private calculMontantTva(): number {
    // let montantTva = this.tvaCalcule - this.tvaImpute;
    // if(this.typesMouvementsSelected.id == "DB") montantTva = this.tvaImpute -  this.tvaCalcule;
    // if(montantTva < 0)montantTva = 0;
    // return montantTva;
    return 0;
  }

  private calculMontantTaxable(): number {
    // let montantTaxable = this.tvaCalcule - this.tvaImpute;
    // if(this.typesMouvementsSelected.id == "CR")
    //   montantTaxable = this.ventileDevise - montantTaxable;
    // else montantTaxable = montantTaxable - this.ventileDevise;

    // if(montantTaxable < 0)
    //   montantTaxable = 0;
    // else if(this.caseTva.tauxTvaCase)
    //   montantTaxable = (montantTaxable / (1+ (this.caseTva.tauxTvaCase / 100)));

    // return montantTaxable;
    return 0;
  }

  private loadCaseTva() {
    // if (+this.numeroCaseTva) {
    //   this.tvaLoading = true;
    //   AchatVenteApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal)
    //     .then(caseTva => {
    //       this.numeroCaseTva = caseTva.numeroCase.toString();
    //       this.caseTva = caseTva;
    //       this.errorMessage = "";
    //     })
    //     .catch((err: AxiosError) => {
    //       this.numeroCaseTva = "";
    //       this.caseTva = new CaseTva();
    //       if (err.request.status != 505)
    //         this.errorMessage = err.request.response;
    //     })
    //     .finally(() => {
    //       this.tvaLoading = false;
    //     });
    // } else {
    //   this.caseTva.Refresh();
    //   this.caseTva = new CaseTva();
    // }
  }
  private OpenSearchCaseTva(): void {
    //(this.$refs.caseTvaDialog as SearchCaseTvaVue)
    // .open(this.numeroJournal)
    // .then(caseTva => {
    //   this.numeroCaseTva = caseTva.numeroCase.toString();
    //   this.caseTva = caseTva;
    //   this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
    // }).catch(() => {
    //   this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus())
    // });
  }

  private GetModel(): Extrait {
    // let contrepartie = new PieceComptableContrepartie();
    // contrepartie.typeCompte = this.typesComptesSelected ? this.typesComptesSelected.id : "";
    // contrepartie.numeroCompte = parseInt(this.numeroCompte);
    // contrepartie.compteLibelle = this.nomCompte;
    // contrepartie.libelle = this.libelle;
    // contrepartie.codeMouvement = this.typesMouvementsSelected ? this.typesMouvementsSelected.id : "";
    // contrepartie.montantDevise = parseFloat(this.montant);
    // contrepartie.montantBase = parseFloat(this.montant);
    // contrepartie.codeDevise = this.devisesSelected ? this.devisesSelected.id : 0;
    // contrepartie.libelleDevise = this.devisesSelected ? this.devisesSelected.libelle : "";
    // contrepartie.caseTva = new CaseTva(this.caseTva);
    // return contrepartie;
    return new Extrait();
  }

  private sendExtrait() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.dialog = false;
        this.resolve(this.GetModel());
      }
    });
  }

  @Watch("caseTva")
  private caseTvaChanged(val: string, oldVal: string) {
    //if(!this.readonly && !this.montant) this.calculMontant();
  }

  @Watch("devisesSelected")
  private deviseChanged(val: string, oldVal: string) {
    //if(!this.readonly && !this.montant) this.calculMontant();
  }

  private deleteContrepartie() {
    this.dialog = false;
    this.resolve();
  }

  private close() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}
</style>
