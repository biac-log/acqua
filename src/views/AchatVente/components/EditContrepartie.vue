<template>
  <v-dialog v-model="dialog" width="800" @keydown.enter.stop="sendContrepartie">
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-card-title>
          <v-col cols="12" v-if="errorMessage">
            <v-alert dense outlined type="error" class="ma-0">
              {{ errorMessage }}
            </v-alert>
          </v-col>
          <v-col cols="12">
            Contrepartie
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
                autofocus
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="N° compte"
                v-model="numeroCompte"
                :filled="readonly"
                :readonly="readonly"
                :append-icon="readonly ? '' : 'mdi-magnify'"
                :hide-details="readonly"
                ref="firstElement"
                @keypress.enter.stop="loadCompte"
                @blur="loadCompte"
                @click:append="OpenSearchCompte()"
              >
              </v-text-field>
              <SearchCompteContrepartieVue
                ref="compteDialog"
              ></SearchCompteContrepartieVue>
            </v-col>
            <v-col cols="6">
              <v-text-field
                ref="firstElement"
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
                :filled="readonly"
                :readonly="readonly"
                :rules="libelleRules"
                :hide-details="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
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
            <v-col>
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
            <v-col>
              <v-text-field
                v-model="montant"
                label="Montant"
                :filled="readonly"
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-text-field
                ref="firstElement"
                label="Numéro case TVA"
                v-model="numeroCaseTva"
                :filled="readonly"
                :readonly="readonly"
                :append-icon="readonly ? '' : 'mdi-magnify'"
                :rules="numeroCaseTvaRules"
                :hide-details="readonly"
                :loading="tvaLoading"
                @keypress.enter="loadCaseTva"
                @blur="loadCaseTva"
                @click:append="OpenSearchCaseTva()"
              >
              </v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Libellé case TVA"
                v-model="libelleCaseTva"
                :filled="readonly"
                :hide-details="readonly"
                tabindex="-1"
                readonly
              ></v-text-field>
              <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
            tabindex="-1"
            >Fermer</v-btn
          >
          <v-btn
            ref="btnValidate"
            color="success"
            text
            :disabled="!isValid"
            @click="sendContrepartie"
            v-if="!readonly"
            >Valider</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop } from "vue-property-decorator";
import {
  PieceComptableContrepartie,
  TypeCompte,
  Devise,
  TypeMouvement,
  getTypesMouvements
} from "@/models/AchatVente";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import { CompteApi } from "@/api/CompteApi";
import SearchCompteContrepartieVue from "./SearchCompteContrepartie.vue";
import SearchCaseTvaVue from "./SearchCaseTva.vue";
import axios, { AxiosError } from "axios";
import CompteGenerealSearch from "../../../models/Compte/CompteGeneralSearch";

@Component({
  name: "EditContrepartie",
  components: { SearchCompteContrepartieVue, SearchCaseTvaVue }
})
export default class extends Vue {
  private dialog: boolean = false;
  @PropSync("isReadOnly")
  public readonly!: boolean;
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
    (v: string) => !!v || "Case tva obligatoire"
  ];
  private libelleCaseTva: string = "";
  private tvaLoading = false;
  private reference: string = "";
  private referenceRules: any = [(v: string) => !!v || "Référence obligatoire"];

  mounted() {
    AchatVenteApi.getTypesComptes().then(resp => {
      this.typesComptes = resp;
    });
  }

  public open(
    contrepartie: PieceComptableContrepartie,
    numeroJournal: number,
    deviseEntete: Devise
  ): Promise<PieceComptableContrepartie> {
    this.dialog = true;

    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(contrepartie, numeroJournal, deviseEntete);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  public openNew(
    numeroJournal: number,
    deviseEntete: Devise
  ): Promise<PieceComptableContrepartie> {
    this.dialog = true;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(new PieceComptableContrepartie(), numeroJournal, deviseEntete);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private init(
    contrepartie: PieceComptableContrepartie,
    numeroJournal: number,
    deviseEntete: Devise
  ) {
    this.initDevises(deviseEntete, contrepartie);
    this.numeroJournal = numeroJournal;

    this.typesComptesSelected =
      this.typesComptes.find(tc => tc.id == contrepartie.typeCompte) ||
      this.typesComptes[0];
    this.devisesSelected =
      this.devises.find(d => d.id == contrepartie.codeDevise) ||
      this.devises[0];
    this.numeroCompte = contrepartie.numeroCompte
      ? contrepartie.numeroCompte.toString()
      : "";
    this.nomCompte = contrepartie.compteLibelle;
    this.libelle = contrepartie.libelle;
    this.typesMouvementsSelected =
      this.typesMouvements.find(d => d.id == contrepartie.codeMouvement) ||
      this.typesMouvements[0];
    this.montant = contrepartie.montantBase
      ? contrepartie.montantBase.toString()
      : "";
    this.numeroCaseTva = contrepartie.caseTva.numeroCase
      ? contrepartie.caseTva.numeroCase.toString()
      : "";
    this.libelleCaseTva = contrepartie.caseTva.libelleCase;
  }

  private initDevises(
    deviseEntete: Devise,
    contrepartie?: PieceComptableContrepartie
  ) {
    this.devises = [];
    this.devises.push(new Devise({ id: 1, libelle: "EUR" }));
    if (deviseEntete && !this.devises.find(d => d.id == deviseEntete.id))
      this.devises.push(deviseEntete);
    if (contrepartie && contrepartie.codeDevise != 0) {
      if(!this.devises.find(d => d.id == contrepartie.codeDevise)){
        this.devises.push(
          new Devise({
            id: contrepartie.codeDevise,
            libelle: contrepartie.libelleDevise
          })
        );
        this.devisesSelected = this.devises.find(d => d.id == contrepartie.codeDevise) || this.devises[0];
      }else this.devisesSelected = this.devises[0];
    }
  }

  private loadCompte() {
    this.compteLoading = true;
    if (this.typesComptesSelected && this.numeroCompte) {
      CompteApi.getCompteGeneral(
        this.typesComptesSelected.id,
        this.numeroCompte.toString()
      )
        .then(compte => {
          this.setCompte(compte);
        })
        .finally(() => {
          this.compteLoading = false;
        });
    }
  }
  private OpenSearchCompte(): void {
    if (this.typesComptesSelected) {
      (this.$refs.compteDialog as SearchCompteContrepartieVue)
        .open(this.typesComptesSelected)
        .then(compte => {
          this.setCompte(compte);
          (this.$refs.libelle as any).focus();
        });
    }
  }
  private setCompte(compte: CompteGenerealSearch) {
    this.numeroCompte = compte.numero.toString();
    this.nomCompte = compte.nom;
    this.numeroCaseTva = compte.numeroCase.toString();
    this.libelleCaseTva = compte.libelleCase;
  }

  private loadCaseTva() {
    if (+this.numeroCaseTva) {
      this.tvaLoading = true;
      AchatVenteApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal)
        .then(caseTva => {
          this.numeroCaseTva = caseTva ? caseTva.numeroCase.toString() : "";
          this.libelleCaseTva = caseTva ? caseTva.libelleCase : "";
          this.errorMessage = "";
        })
        .catch((err: AxiosError) => {
          this.numeroCaseTva = "";
          this.libelleCaseTva = "";
          if (err.request.status != 505)
            this.errorMessage = err.request.response;
        })
        .finally(() => {
          this.tvaLoading = false;
        });
    } else {
      this.numeroCaseTva = "";
      this.libelleCaseTva = "";
    }
  }
  private OpenSearchCaseTva(): void {
    (this.$refs.caseTvaDialog as SearchCaseTvaVue)
      .open(this.numeroJournal)
      .then(caseTva => {
        this.numeroCaseTva = caseTva.numeroCase.toString();
        this.libelleCaseTva = caseTva.libelleCase;
        (this.$refs.btnValidate as any).focus();
      });
  }

  private GetModel(): PieceComptableContrepartie {
    let contrepartie = new PieceComptableContrepartie();

    contrepartie.typeCompte = this.typesComptesSelected
      ? this.typesComptesSelected.id
      : "";
    contrepartie.numeroCompte = parseInt(this.numeroCompte);
    contrepartie.compteLibelle = this.nomCompte;
    contrepartie.libelle = this.libelle;
    contrepartie.codeMouvement = this.typesMouvementsSelected
      ? this.typesMouvementsSelected.id
      : "";
    contrepartie.montantDevise = parseFloat(this.montant);
    contrepartie.montantBase = parseFloat(this.montant);
    contrepartie.codeDevise = this.devisesSelected
      ? this.devisesSelected.id
      : 0;
    contrepartie.libelleDevise = this.devisesSelected
      ? this.devisesSelected.libelle
      : "";
    contrepartie.caseTva.numeroCase = parseInt(this.numeroCaseTva);
    contrepartie.caseTva.libelleCase = this.libelleCaseTva;

    return contrepartie;
  }

  private sendContrepartie() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.dialog = false;
        this.resolve(this.GetModel());
      }
    })
  }

  private close() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style></style>
