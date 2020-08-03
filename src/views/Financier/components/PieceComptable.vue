<template>
  <v-dialog
    v-model="dialog"
    scrollable
    eager
    width="80%"
    @click:outside="closeDialog"
    @keydown.f2="ModifierPiece"
    @keydown.46.prevent.stop="DeletePiece"
    @keydown.107.prevent.stop="createExtrait"
    @keydown.alt.enter.stop="savePiece()"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <p class="mb-0" v-if="numeroPiece">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
            <p class="mb-0" v-else>Nouvelle pièce</p>
            <p class="ml-10 mb-0 textMini">{{ periode.libellePeriodeFull }}</p>
            <p class="ml-5 mb-0 textMini">Journal {{ journal.fullLibelle }}</p>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-5"
            color="success"
            @click="ModifierPiece"
            v-if="readonly"
          >
            <v-icon left>mdi-pencil</v-icon>Modifier
          </v-btn>
          <v-btn
            class="mr-10"
            color="error"
            v-if="readonly"
            @click="DeletePiece"
            :loading="deleteIsLoading"
          >
            <v-icon left>mdi-delete</v-icon>Supprimer
          </v-btn>
          <v-btn
            ref="buttonClose"
            class="ml-10"
            icon
            color="white"
            @click="closeDialog()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-col cols="12" class="pr-5">
            <v-row fill-height no-gutters>
              <v-col cols="12" x-lg="5" lg="12">
                <v-row dense>
                  <v-col cols="4">
                    <v-text-field
                      v-model="libelleCompte"
                      label="Compte"
                      :filled="readonly"
                      readonly
                      tabindex="-1"
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Solde initial"
                      v-model="soldeInitial"
                      :filled="readonly"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Solde actuel"
                      v-model="soldeActuel"
                      :filled="readonly"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <DatePicker
                      ref="refDatePiece"
                      name="datePiece"
                      label="Date pièce"
                      :date.sync="datePiece"
                      :readonly.sync="readonly"
                      :filled="readonly"
                      :rules.sync="datePieceRules"
                    ></DatePicker>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <ExtraitsVue
                  ref="gridExtraits"
                  :Journal.sync="journal"
                  :Extraits.sync="extraits"
                  :IsReadOnly.sync="readonly"
                  :DatePiece.sync="datePiece"
                  @CreateExtrait="createExtrait"
                  @EditExtrait="editExtrait"
                ></ExtraitsVue>
              </v-col>
            </v-row>
          </v-col>
          <ExtraitVue
            ref="refExtraitVue"
            :isReadOnly.sync="readonly"
            :DatePiece.sync="datePiece"
          ></ExtraitVue>
        </v-card-text>
        <v-divider v-if="!readonly"></v-divider>
        <v-card-actions v-if="!readonly" class="d-flex">
          <v-btn
            color="error"
            class="ma-2 pr-4 align-self-start"
            text
            tabindex="-1"
            v-if="numeroPiece"
            @click="DeletePiece()"
            :loading="deleteIsLoading"
            >
            Supprimer</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="warning"
            class="ma-2 mt-0 pr-4 align-self-start"
            text
            tabindex="-1"
            v-if="!numeroPiece && !forcerNumero"
            @click="forcerNumero = true"
            >
            Forcer le numéro de pièce</v-btn
          >
          <v-text-field 
            label="Numéro pièce"
            v-model="numeroToForce"
            v-if="forcerNumero"
            append-icon="mdi-close"
            @click:append="forcerNumero = false"
            :rules="numeroToForceRules"
            hide-details="auto"
            autofocus
            dense
            outlined
            class="shrink align-self-start"
          ></v-text-field>
          <v-btn
            color="blue darken-1"
            class="ma-2 mt-0 pr-4 align-self-start"
            tile outlined
            @click="cancelEdit()"
            tabindex="-1"
            >
            <v-icon left>mdi-close</v-icon> Annuler</v-btn>
          <v-btn ref="btnValidate" class="ma-2 mt-0 pr-4 align-self-start" tile color="success" :loading="saveLoading" :disabled="!isValid"  @click="savePiece()">
            <v-icon left>mdi-content-save</v-icon>Sauvegarder
          </v-btn>
        </v-card-actions>
        <v-alert type="error" border="left" v-if="errorMessage"  class="ml-4 mr-4">
            {{errorMessage}}
        </v-alert>
        <Confirm ref="confirmDialog"></Confirm>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import axios from "axios";
import moment from "moment";
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  Devise,
  Journal,
	CompteBanque,
	Piece,
	Extrait,
} from "@/models/Financier";
import { AchatVenteApi } from '@/api/AchatVenteApi';
import { DateTime } from '@/models/DateTime';
import DatePicker from '@/components/DatePicker.vue';
import ExtraitsVue from "./Extraits.vue";
import { DeviseApi } from "@/api/DeviseApi";
import { FinancierApi } from '../../../api/FinancierApi';
import ExtraitVue from "./Extrait.vue";
import _, { sum } from "lodash";
import Confirm from "@/components/Confirm.vue";
import { displayAxiosError } from '@/utils/ErrorMethods';
import { PieceSaveDTO, ExtraitSaveDTO, VentilationSaveDTO } from '../../../models/Financier/Save/PieceSave';

@Component({
  name: "PieceComptableVue",
  components: { ExtraitsVue, DatePicker, ExtraitVue, Confirm}
})
export default class extends Vue {
  private dialog = false;
  private readonly = false;
  private resolve: any;
  private reject: any;
  private isValid = true;
  private errorMessage = "";
  private deleteIsLoading = false;

  private periode = new PeriodeComptable();
  private journal = new Journal();
  private numeroPiece = "";
  private libelleCompte = "";

  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [(v: string) => !!v || "Date obligatoire",
                                 (v: string) => DateTime.isValid(v) || "Date invalide",
                                 (v: string) => this.validateDatePiece(v) || "La date est hors période"]

  private extraits: Extrait[] = [];
  private soldeInitial: string = "";
  private soldeActuel: string= "";

  private forcerNumero: boolean = false;
  private numeroToForce: string = "";
  private numeroToForceRules: any = [(v: string) =>  !!v || "Numéro obligatoire", 
                                     (v: string) => !!v.toNumber() || "Numéro invalide"];

  private saveLoading = false;
  private deleteLoading = false;

  private validateDatePiece(date: string) : boolean { 
    let dateTime = new DateTime(date);
    return dateTime.isBetween(this.periode.dateDebut, this.periode.dateFin);
  }

  private hash = "";
  public async OpenNew(periode: PeriodeComptable, journal: Journal) : Promise<EntetePieceComptable>{
    this.dialog = true;
    this.readonly = false;
    this.periode = periode;
    this.journal = journal;
    this.libelleCompte = `${journal.compteBanque.numero.toString()} ${journal.compteBanque.nom}`; 
    let solde = await FinancierApi.getSoldeCompte(journal.numeroCompteBanque);
    this.soldeInitial = solde.toDecimalString();

    let today = DateTime.today();
    if(today.isBefore(this.periode.dateDebut))
      this.datePiece = this.periode.dateDebut;
    else if(today.isAfter(this.periode.dateFin)) 
      this.datePiece = this.periode.dateFin;
    else this.datePiece = today;

    this.$nextTick(() => (this.$refs.refDatePiece as DatePicker).focus());
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public Open(periode: PeriodeComptable, journal: Journal, piece: Piece) : Promise<EntetePieceComptable>{
    this.dialog = true;
    this.readonly = true;
    this.periode = periode;
    this.journal = journal;
    this.init(piece);
    
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private createExtrait() {
    if(!this.readonly){
      (this.$refs.refExtraitVue as ExtraitVue).openNew(this.journal)
      .then((resp: Extrait) => {
        const maxLigne = this.extraits?.length ?  Math.max(...this.extraits.map(i => i.numeroExtrait)) : 0;
        resp.numeroExtrait = maxLigne + 1;
        this.extraits.push(resp);
      })
      .finally(() => {
        (this.$refs.gridExtraits as ExtraitsVue)?.focus();
      });
    }
  }

  private editExtrait(extrait: Extrait) {
    (this.$refs.refExtraitVue as ExtraitVue).open(this.journal, extrait)
      .then((resp: Extrait) => {
        if(resp)
          Vue.set(this.extraits, this.extraits.findIndex(d => d == extrait), resp);
        else 
          this.extraits.splice(this.extraits.indexOf(extrait), 1);
      }).catch(() => {
        
      }).finally(() => {
        this.calculSolde();
        (this.$refs.gridExtraits as ExtraitsVue)?.focus();
      });
  }

  private init(piece: Piece){
    this.numeroPiece = piece.numeroPiece.toString();
    this.libelleCompte = `${piece.numeroCompteFinancier.toString()} ${piece.nomCompteFinancier}`; 
    this.datePiece = new DateTime(piece.datePiece);
    this.soldeInitial = piece.soldeInitial.toDecimalString(2);
    this.extraits = piece.extraits;
    this.hash = piece.hash;
  }

  private reset(){
    this.errorMessage = "";
    this.periode = new PeriodeComptable();
    this.journal = new Journal();
    this.libelleCompte = "";
    this.datePiece = new DateTime();
    this.extraits = [];
    this.soldeInitial = "";
    this.soldeActuel = "";
    (this.$refs.extraits as any)?.reset();
  }

  @Watch("extraits")
  private calculSolde(){
    let sumCredit = _.sum(this.extraits.map(m => m.montantCredit.toNumber()));
    let sumDebit = _.sum(this.extraits.map(m => m.montantDebit.toNumber()));
    this.soldeActuel = (this.soldeInitial.toNumber() + sumDebit - sumCredit).toDecimalString();
  }

  private DeletePiece(){
    (this.$refs.confirmDialog as Confirm)
    .open(
      "Suppression",
      `Êtes-vous sur de vouloir supprimer la piece ${this.journal.numero}.${this.numeroPiece} ?`,
      "error",
      "Supprimer"
    )
    .then((resp) => {
      if (resp) {
        this.deleteIsLoading = true;    
        FinancierApi.deletePieceComptable(this.periode.typePeriodeComptable, this.journal.numero, this.numeroPiece.toNumber())
        .then(() => {
          this.dialog = false;
          this.resolve();
        }).catch((err) => {
          this.errorMessage = displayAxiosError(err);
        }).finally(() => {
          this.deleteIsLoading = false;
        });
      }
    });
  }

  private async savePiece() {
    (this.$refs.form as any).validate();
    this.$nextTick(async () => {
      if (this.isValid) {
        let pieceToSave = this.GetModelToSave();
        if(pieceToSave.numeroPiece == 0)
          this.addPiece(pieceToSave);
        else 
          this.updatePiece(pieceToSave);
      }
    })
  }

  private addPiece(piece: PieceSaveDTO) {
    this.saveLoading = true;
    this.readonly = true;
    this.errorMessage = "";
    FinancierApi.AddPieceComptable(piece).then((numeroPiece) => {
      this.numeroPiece = numeroPiece.toString();
      this.resolve(this.GetModelForGrid());
      (this.$refs.form as any).resetValidation();
      this.dialog = false;
      this.reset();
    }).catch((err) => {
      this.errorMessage = displayAxiosError(err);
      this.readonly = false;
    }).finally(()=> {
      this.saveLoading = false;
    });
  }

  private updatePiece(piece: PieceSaveDTO) {
    this.saveLoading = true;
    this.errorMessage = "";
    let pieceComptaToSave = this.GetModelToSave();
    this.readonly = true;
    FinancierApi.UpdatePieceComptable(pieceComptaToSave).then(() => {
      this.resolve(this.GetModelForGrid());
      this.dialog = false;
      this.reset();
    }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
        this.readonly = false;
    }).finally(()=> {
      this.saveLoading = false;
    });
  }

  private GetModelToSave(): PieceSaveDTO {
    let pieceToSave: PieceSaveDTO = new PieceSaveDTO();
    if(this.forcerNumero && this.numeroToForce)
      pieceToSave.numeroPiece = +this.numeroPiece;

    pieceToSave.periode = this.periode.typePeriodeComptable;
    pieceToSave.numeroJournal = this.journal.numero;
    pieceToSave.numeroPiece = this.numeroPiece.toNumber();
    pieceToSave.datePiece = this.datePiece.toUtc();
    pieceToSave.soldeInitial = this.soldeInitial.toNumber();
    pieceToSave.hash = this.hash;
    pieceToSave.extraits = [];

    let i = 1;
    this.extraits.forEach(e => {
      let extrait : ExtraitSaveDTO = new ExtraitSaveDTO();
      extrait.numeroExtrait = e.numeroExtrait;
      extrait.montantBase = e.montantBase;
      extrait.montantDevise = e.montantDevise;
      extrait.libelle = e.libelleReglement;
      extrait.codeMouvement = e.codeMouvement;
      extrait.codeReglement = e.codeReglement;
      pieceToSave.extraits.push(extrait);

      e.ventilations.forEach(v => {
        let ventilation : VentilationSaveDTO = new VentilationSaveDTO();
        ventilation.numeroVentilation= v.numeroVentilation;
        ventilation.typeCompte = v.typeCompte;
        ventilation.numeroCompte = v.numeroCompte;
        ventilation.montantBase = v.montantBase;
        ventilation.montantDevise = v.montantDevise;
        ventilation.libelle = v.libelle;
        ventilation.codeDevise = v.codeDevise;
        ventilation.numeroCaseTVA = v.caseTva.numeroCase;
        ventilation.codeMouvement = v.codeMouvement;
        ventilation.referenceJournal = v.referenceJournal;
        ventilation.referencePiece = v.referencePiece;
        ventilation.dossier = v.dossier;
        extrait.ventilations.push(ventilation);
      });
    });
    return pieceToSave;
  }

  private GetModelForGrid() : EntetePieceComptable {
    let entetePieceComptable = new EntetePieceComptable();
    entetePieceComptable.numeroJournal = this.journal.numero;
    entetePieceComptable.numeroPiece = this.numeroPiece.toNumber();
    entetePieceComptable.soldeInitiale = this.soldeInitial.toNumber();
    entetePieceComptable.totalDebit = _.sum(this.extraits.map(m => m.montantDebit.toNumber()));;
    entetePieceComptable.totalCredit = _.sum(this.extraits.map(m => m.montantCredit.toNumber()));;
    entetePieceComptable.soldeFinale = this.soldeActuel.toNumber();
    //TODO : test si pièce équilibré
    entetePieceComptable.pieceEquilibree = true;
    entetePieceComptable.libelleDevise = this.journal.devise.libelle;
    entetePieceComptable.datePiece = this.datePiece.toString();
    entetePieceComptable.libelle = this.journal.libelle;
    return entetePieceComptable;
  }

  private ModifierPiece(){
    this.readonly = false;
    (this.$refs.refDatePiece as DatePicker).focus();
  }

  private closeDialog(){
    this.reset();
    this.dialog = false;
    this.reject();
  }
}
</script>

<style>
.textMini {
  font-size: 12px;
}

.warningMessage{
  color: #FB8C00;
  font-weight: 500;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}
</style>
