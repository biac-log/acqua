<template>
  <v-dialog
    v-model="dialog"
    scrollable
    width="2000"
    :persistent="!piecereadonly"
    @keydown.f2="ModifierPiece"
    @keydown.del.prevent.stop="DeletePiece"
    @keydown.plus.prevent.stop="createContrepartie"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <p class="mb-0" v-if="numeroPiece">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
            <p class="mb-0" v-if="!numeroPiece">Nouvelle pièce</p>
            <p class="ml-10 mb-0 textMini">Période {{ periodeDisplay }}</p>
            <p class="ml-5 mb-0 textMini">Journal {{ journal.fullLibelle }}</p>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-5"
            color="success"
            @click="ModifierPiece"
            v-if="piecereadonly"
          >
            <v-icon left>mdi-pencil</v-icon>Modifier
          </v-btn>
          <v-btn
            class="mr-10"
            color="error"
            v-if="piecereadonly"
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
          <v-row fill-height>
            <v-col cols="5">
              <v-row dense>
                <v-col cols="4">
                  <v-text-field
                    label="Numéro compte tiers"
                    ref="numeroCompteTier"
                    v-model="numeroCompteTier"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :append-icon="piecereadonly ? '' : 'mdi-magnify'"
                    :rules="numeroCompteTierRules"
                    @keypress.enter="loadCompte"
                    @keyup.enter="$event.target.select()"
                    @click:append="OpenSearchCompte()"
                    @focus="$event.target.select()"
                    validate-on-blur
                    @blur="loadCompte"
                    :hide-details="piecereadonly"
                    autofocus
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    label="Nom compte tiers"
                    :value="compteTiersNom"
                    :filled="piecereadonly"
                    :hide-details="piecereadonly"
                    tabindex="-1"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    label="Libelle"
                    ref="libellePiece"
                    counter
                    maxlength="23"
                    v-model="libelle"
                    :value="libellePiece"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :hide-details="piecereadonly"
                    :color="libelleWarningMessage ? 'orange' : 'primary'"
                    :messages="libelleWarningMessage"
                    :rules="libelleRules"
                    validate-on-blur
                    @blur="validateLibelle"
                  >
                    <template slot="message">
                      <span class="warningMessage"> {{ libelleWarningMessage }}</span>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="2">
                  <v-select
                    :items="devises"
                    v-model="deviseSelected"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :hide-details="piecereadonly"
                    return-object
                    item-text="libelle"
                    label="Devise pièce"
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Montant"
                    v-model="montantDevise"
                    :rules="numberRules"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :hide-details="piecereadonly"
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Montant Escompte"
                    v-model="montantEscompte"
                    :rules="numberRules"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :hide-details="piecereadonly"
                  ></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-text-field
                    label="Taux"
                    readonly
                    v-model="taux"
                    :filled="piecereadonly"
                    :hide-details="piecereadonly"
                    tabindex="-1"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <DatePicker
                    label="Date pièce"
                    :date.sync="datePiece"
                    :readonly.sync="piecereadonly"
                    :rules.sync="datePieceRules"
                  ></DatePicker>
                </v-col>
                <v-col cols="4">
                  <DatePicker
                    label="Date échéance"
                    :date.sync="dateEcheance"
                    :readonly.sync="piecereadonly"
                    :rules.sync="dateEcheanceRules"
                  ></DatePicker>
                </v-col>
                <v-col cols="4">
                  <v-select
                    v-model="statutSelected"
                    :items="statuts"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    return-object
                    item-value="id"
                    item-text="libelle"
                    label="Statut"
                    hide-details="auto"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <v-checkbox
                    label="Pièce acquitée"
                    v-model="pieceAcquittee"
                    :readonly="piecereadonly"
                  ></v-checkbox>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Montant en devise comptable"
                    v-model="libelleMontantBase"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-card-title>Informations compte tiers</v-card-title>
              <v-row dense>
                <v-col cols="3">
                  <v-text-field
                    label="Solde du compte"
                    v-model="libelleSoldeCompteTiers"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Délai de paiement"
                    v-model="delaiPaiementLibelle"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="% Escompte"
                    v-model="compteTiersEscomptePourcentage"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Nombre jours escompte"
                    v-model="compteTiersEscompteNombreJours"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    label="Compte associé"
                    v-model="libelleCompteAssocie"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    label="Compte achat/vente"
                    v-model="libelleCompteVenteAchat"
                    filled
                    readonly
                    tabindex="-1"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="7">
              <GridContreparties
                ref="gridContreparties"
                :Contreparties.sync="contreparties"
                :IsReadOnly.sync="piecereadonly"
                :Journal.sync="journal"
                :DeviseEntete.sync="deviseSelected"
                :CompteAchatVente.sync="numeroCompteAchatVente"
                :MontantDevise.sync="montantDevise"
                :MontantBase.sync="montantBase"
                :TauxDevise.sync="taux"
                :CodeTaxe.sync="codeTaxe"
                :NomCompteDeTier.sync="compteTiersNom"
              ></GridContreparties>
              <SearchCompteTier ref="compteDialog"></SearchCompteTier>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider v-if="!piecereadonly"></v-divider>
        <v-card-actions v-if="!piecereadonly" class="d-flex">
          <v-btn
            color="error"
            class="ma-2 pr-4 align-self-start"
            text
            tabindex="-1"
            v-if="numeroPiece"
            @click="DeletePiece()"
            :loading="deleteIsLoading"
            >
            Suprrimer</v-btn
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
  PieceComptable,
  PieceComptableContrepartie,
  Devise,
  Statut,
  Journal,
	PieceComptableContrepartieSaveDTO,
  PieceComptableContrepartieDTO,
  PieceComptableSaveDTO
} from "@/models/AchatVente";
import CompteSearch from "@/models/Compte/CompteSearch";
import SearchCompteTier from "./SearchCompteTier.vue";
import Confirm from "@/components/Confirm.vue";
import DatePicker from "@/components/DatePicker.vue";
import { CompteApi } from "@/api/CompteApi";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import GridContreparties from "./GridContreparties.vue";
import GridContrepartiesVue from './GridContreparties.vue';
import { CompteDeTier } from '../../../models/Compte/CompteDeTier';
import CompteGenerealSearch from '../../../models/Compte/CompteGeneralSearch';
import { displayAxiosError } from '@/utils/ErrorMethods';
import * as DateMethods from '@/utils/DateMethods'
import { DateTime } from '../../../models/DateTime';


@Component({
  name: "AchatVentePiece",
  components: { SearchCompteTier, GridContreparties, Confirm, DatePicker }
})
export default class extends Vue {
  public piecereadonly: boolean = true;
  private errorMessage: string = "";
  private contreparties: PieceComptableContrepartie[] = [];
  private isValid: boolean = true;
  //Titre
  private periode: PeriodeComptable = new PeriodeComptable();
  private periodeDisplay: string = "";
  private journal: Journal = new Journal();
  private numeroPiece: string = "";

  //Encodage
  private numeroCompteTier: string = "";
  private numeroCompteTierRules: any = [(v: string) => !!v || "Numéro obligatoire",(v: string) => !!+v || "Numéro invalide"];
  private libelle: string = "";
  private libelleRules: any = [(v: string) => !!v || "Libellé obligatoire"];
  private libelleWarningMessage: string = "";
  private montantDevise: string = "";
  private montantEscompte: string = "0";
  private numberRules: any = [(v: string) => (!v || !!+v || +v == 0)  || "Montant invalide"];
  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();
  private statuts: Statut[] = [];
  private statutSelected: Statut = new Statut();
  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [(v: string) => !!v || "Date obligatoire",
                                 (v: string) => DateTime.isValid(v) || "Date invalide",
                                 (v: string) => this.validateDatePiece(v) || "La date est hors période"]

  private dateEcheance: DateTime = new DateTime();
  private dateEcheanceRules: any =[(v: string) => !!v || "Date obligatoire",
                                   (v: string) => DateTime.isValid(v) || "Date invalide",
                                   (v: string) => this.validateDateEcheance(v)]

  private validateDatePiece(date: string) : boolean { 
    let dateTime = new DateTime(date);
    return dateTime.isBetween(this.periode.dateDebut, this.periode.dateFin);
  }

  private validateDateEcheance(date: string) : string | boolean {
    let dateTime = new DateTime(date);
    if(dateTime.isBefore(this.datePiece))
      return "La date doit être supérieur ou égale à la date piece"
    else return true;
  }

  public typeCompte: string = "";
  private isEdit: boolean = false;

  public dialog: boolean = false;
  public searchCompteTiersDialog: boolean = false;

  private compteTiersNom: string = "";
  private libellePiece: string = "";
  private taux: string = "";
  private pieceAcquittee: boolean = false;
  private montantBase: string = "";
  private libelleMontantBase: string = "";
  private libelleSoldeCompteTiers: string = "";
  private delaiPaiementLibelle: string = "";
  private compteTiersEscomptePourcentage: string = "";
  private compteTiersEscompteNombreJours: string = "";
  private libelleCompteAssocie: string = "";
  private numeroCompteAchatVente: string ="";
  private nomCompteAchatVente: string ="";
  private libelleCompteVenteAchat: string = "";
  private codeTaxe: number = 0;
  private hash: string = "";

  private resolve!: any;
  private reject!: any;

  private forcerNumero: boolean = true;
  private numeroToForce: string = "";
  private numeroToForceRules: any = [(v: string) =>  !!v || "Numéro obligatoire", 
                                     (v: string) => !!+v || "Numéro invalide"];

  public async openNew(periode: PeriodeComptable, journal: Journal): Promise<{ action: string, data: EntetePieceComptable}> {
    this.dialog= true;
    this.piecereadonly = false;
    await this.loadDataForEdit();
    this.init(periode, journal);

    let today = DateTime.today();
    if(today.isBefore(this.periode.dateDebut))
      this.datePiece = this.periode.dateDebut;
    else if(today.isAfter(this.periode.dateFin)) 
      this.datePiece = this.periode.dateFin;
    else this.datePiece = today;
    this.$nextTick(() => (this.$refs.btnAdd as any).$el.focus());
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public open(entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal): Promise<{ action: string, data: EntetePieceComptable}> {
    this.dialog=true;
    this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
    this.piecereadonly=true;
    this.init(periode, journal, entete);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

	private init(periode: PeriodeComptable, journal: Journal, entete?: EntetePieceComptable) {
    this.resetForm();
    this.journal = journal;
    this.periode = periode;
    this.periodeDisplay = periode.libellePeriodeFull;
    this.typeCompte = journal.typeCompteChar;
    if(entete){
      this.numeroPiece = entete.codePiece ? entete.codePiece.toString() : "";
      this.GetPiece();
    }
  }
  
  private async loadDataForEdit(){
    await this.loadDevises();
    await this.loadStatuts();
  }

   private resetForm(){
    this.errorMessage = "";
    this.libelleWarningMessage = "";
    this.forcerNumero = false;
    this.numeroToForce = "";

    this.periodeDisplay = "";
    this.journal = new Journal();
    this.numeroPiece= "";
    this.numeroCompteTier= "";
    this.libelle= "";
    this.montantDevise= "";
    this.montantEscompte= "";
    this.deviseSelected = this.devises[0];
    this.statutSelected = this.statuts[0];
    this.datePiece = new DateTime();
    this.dateEcheance = new DateTime();
    this.typeCompte= "";
    this.numeroCompteTier= "";
      
    this.compteTiersNom = "";
    this.libellePiece = "";
    this.taux = ""
    this.pieceAcquittee = false;
    this.montantBase = "";
    this.libelleMontantBase = "";
    this.libelleSoldeCompteTiers = "";
    this.delaiPaiementLibelle = "";
    this.compteTiersEscomptePourcentage = "";
    this.compteTiersEscompteNombreJours = "";
    this.libelleCompteAssocie = "";
    this.numeroCompteAchatVente = "";
    this.nomCompteAchatVente = "";
    this.libelleCompteVenteAchat = "";
    this.codeTaxe = 0;
    this.contreparties = [];
    this.hash = "";
  }

  private async GetPiece() {
    this.errorMessage = "";
    try {
      let pieceComptable = await AchatVenteApi.getPieceComptable(this.journal.numero, this.numeroPiece);
      this.SetPiece(pieceComptable);
    } catch(err) {
      this.errorMessage = displayAxiosError(err);
    }
  }

  private SetPiece(pieceComptable: PieceComptable) {
    this.contreparties = pieceComptable.contreparties;

    this.numeroCompteTier = pieceComptable.compteTiersNumero.toString();
    this.libelle = pieceComptable.libelle;

    this.datePiece = new DateTime(pieceComptable.datePiece);
    this.dateEcheance = new DateTime(pieceComptable.dateEcheance);

    this.montantDevise = pieceComptable.montantDevise.toString();
    this.montantBase = pieceComptable.montantBase.toString();
    this.montantEscompte = pieceComptable.montantEscompteDevise.toString();
    this.compteTiersNom = pieceComptable.compteTiersNom;
    this.libellePiece = pieceComptable.libelle;
    this.taux = pieceComptable.taux.toString();
    this.pieceAcquittee = pieceComptable.pieceAcquittee;
    this.libelleMontantBase = pieceComptable.libelleMontantBase;
    this.libelleSoldeCompteTiers = pieceComptable.libelleSoldeCompteTiers;
    this.delaiPaiementLibelle = pieceComptable.delaiPaiementLibelle;
    this.compteTiersEscomptePourcentage = pieceComptable.compteTiersEscomptePourcentage;
    this.compteTiersEscompteNombreJours = pieceComptable.compteTiersEscompteNombreJours;
    this.libelleCompteAssocie = pieceComptable.libelleCompteAssocie;
    this.numeroCompteAchatVente = pieceComptable.compteVenteAchatNumero.toString();
    this.libelleCompteVenteAchat = pieceComptable.libelleCompteVenteAchat;
    
    this.deviseSelected = pieceComptable ? this.getDeviseToSelect(new Devise({id: pieceComptable.codeDevise, libelle: pieceComptable.libelleDevise, typeDevise: "D"})) : this.devises[0];
    this.statutSelected = pieceComptable ? this.getStatutToSelect(new Statut({id: pieceComptable.statut, libelle: pieceComptable.statutLibelle})) : this.statuts[0];
    this.hash = pieceComptable.hash;
  }

  private compteLoading: boolean = false;
  private loadCompte() {
    if(this.piecereadonly) return;


    this.compteLoading = true;
    if(+this.numeroCompteTier){
      CompteApi.getCompteDeTier(this.typeCompte, this.numeroCompteTier.toString())
      .then(compte => {
        this.setCompteDeTier(compte);
      }).catch((err) => {
        this.setCompteDeTier()
        this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
      })
      .finally(() => {
        this.compteLoading = false;
      });
    }
  }

  private OpenSearchCompte(): void {
    if(this.piecereadonly) return;

    (this.$refs.compteDialog as SearchCompteTier)
      .open(this.typeCompte)
      .then(compte => {
        this.numeroCompteTier = compte.numero.toString();
        this.loadCompte();
        this.$nextTick(() => (this.$refs.libellePiece as any)?.focus());
      }).catch(() => {
        this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
      });
  }
  private async setCompteDeTier(compte?: CompteDeTier) {
    this.numeroCompteTier = compte ? compte.numero.toString() : "";
    this.compteTiersNom = compte ?  compte.nom : "";
    this.deviseSelected = compte ? this.getDeviseToSelect(new Devise({id: compte.codeDevise, libelle: compte.libelleDevise, typeDevise: "D"})) : this.devises[0];
    this.libelleSoldeCompteTiers = compte ? compte.libelleSoldeCompteTiers: "";
    this.compteTiersEscomptePourcentage = compte ? compte.escomptePourcentage.toString(): "";
    this.compteTiersEscompteNombreJours = compte ? compte.escompteNombreJours.toString(): "";
    this.libelleCompteAssocie = compte ? compte.libelleCompteAssocie: "";
    this.numeroCompteAchatVente = compte ? compte.compteVenteAchatNumero.toString(): "";
    this.libelleCompteVenteAchat = compte ? compte.libelleCompteVenteAchat : "";
    this.delaiPaiementLibelle = compte ? compte.delaiPaiementLibelle : "";
    this.codeTaxe = compte ? compte.codeTaxe : 0;
    this.initDateEcheance(this.numeroCompteTier, this.typeCompte, this.datePiece);
  }

  private async ModifierPiece() {
    await this.loadDataForEdit();
    this.piecereadonly = false;
    this.$nextTick(() => (this.$refs.numeroCompteTier as any)?.focus());
  }

  private async loadDevises() {
    if(this.devises.length <= 1){
      this.devises = await AchatVenteApi.getAllDevises();
    }
  }
  private getDeviseToSelect(deviseSelected: Devise): Devise{
    let deviseToSelect = this.devises.find(d => d.id == deviseSelected.id);
    if(!deviseToSelect){
      this.devises.push(deviseSelected);
      return deviseSelected;
    }
    else return deviseToSelect;
  }

  private async loadStatuts(){
    if(this.statuts.length <= 1){
      this.statuts = await AchatVenteApi.getAllStatut();
    }
  }
  private getStatutToSelect(statutSelected: Statut): Statut {
    let statutToSelect = this.statuts.find(d => d.id == statutSelected.id);
    if(!statutToSelect)
    {
      this.statuts.push(statutSelected);
      return statutSelected;
    }
    else return statutSelected;
  }

  @Watch("datePiece")
  private datePieceChanged(val: DateTime, oldVal: DateTime) {
    if (!this.piecereadonly) {
      this.initDateEcheance(this.numeroCompteTier, this.typeCompte, val);
      this.initTauxDevise(this.deviseSelected.id, val);
    }
  }

  private initDateEcheance(numeroCompteTier: string, typeComptetier: string, datePiece : DateTime){
    if(this.numeroCompteTier && this.typeCompte && datePiece.isValid()){
      AchatVenteApi.getDateEcheance(
        typeComptetier,
        numeroCompteTier,
        datePiece
      ).then(dateEcheance => {
        this.dateEcheance = dateEcheance;
      }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
      });
    }
  }

  private initTauxDevise(numeroDevise: number, datePiece: DateTime){
    if(!numeroDevise || numeroDevise == 1)
      this.taux = "1";
    else {
      AchatVenteApi.getTaux(numeroDevise, datePiece)
      .then((resp) => {
        this.taux = resp.toFixed(2);
      }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
      });
    }
  }

  @Watch("montantDevise")
  private montantDeviseChanged(val: string, oldVal: string){
    if(!this.piecereadonly)
      this.recalculmontantBase();
  }

  @Watch("deviseSelected")
  private deviseSelectedChanged(val: Devise, oldVal: Devise){
    if(!this.piecereadonly && val){
      AchatVenteApi.getTaux(this.deviseSelected.id, this.datePiece)
      .then((resp) => {
        this.taux = resp.toFixed(2);
      }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
      });
    }
  }

  private recalculmontantBase(){
    if(this.piecereadonly) return;

    if(+this.taux && +this.montantDevise){
      this.montantBase = (Number.parseFloat(this.montantDevise) * Number.parseFloat(this.taux)).toFixed(2);
      this.libelleMontantBase = `${this.montantBase} ${this.deviseSelected?.libelle}`;
    }
    else{
      this.montantBase = "";
      this.libelleMontantBase = "";
    }
  }

  private createContrepartie(){
    (this.$refs.gridContreparties as GridContrepartiesVue).createContrepartie();
  }

  private saveLoading: boolean = false;

  private savePiece() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        let pieceToSave = this.GetModelToSave();
        if(pieceToSave.numeroPiece == 0)
          this.addPiece(pieceToSave);
        else 
          this.updatePiece(pieceToSave);
      }
    })
  }
    

  private addPiece(piece: PieceComptableSaveDTO) {
    this.saveLoading = true;
    this.piecereadonly = true;
    this.errorMessage = "";
    AchatVenteApi.AddPiece(piece).then((numeroPiece) => {
      this.numeroPiece = numeroPiece.toString();
      this.resolve({ action: "ADD", data: this.GetModelForGrid()});
      this.dialog = false;
    }).catch((err) => {
      this.errorMessage = displayAxiosError(err);
      this.piecereadonly = false;
    }).finally(()=> {
      this.saveLoading = false;
    });
  }

  private updatePiece(piece: PieceComptableSaveDTO) {
    this.saveLoading = true;
    this.errorMessage = "";
    let pieceComptaToSave = this.GetModelToSave();
    this.piecereadonly = true;
    AchatVenteApi.UpdatePiece(pieceComptaToSave).then(() => {
      this.resolve({ action: "UPDATE", data: this.GetModelForGrid()});
      this.dialog = false;
    }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
        this.piecereadonly = false;
    }).finally(()=> {
      this.saveLoading = false;
    });
  }

  private deleteIsLoading : boolean = false;
  private DeletePiece() {
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
          AchatVenteApi.DeletePiece(this.periode.typePeriodeComptable, this.journal.numero, +this.numeroPiece)
          .then(() => {
            this.dialog = false;
            this.resolve({ action: "DELETE", data: this.GetModelForGrid()});
          }).catch((err) => {
            this.errorMessage = displayAxiosError(err);
          }).finally(() => {
            this.deleteIsLoading = false;
          });
        }
      });
  }

  private GetModelToSave(): PieceComptableSaveDTO {
    let pieceComptaSave: PieceComptableSaveDTO = new PieceComptableSaveDTO();
    if(this.forcerNumero && this.numeroToForce)
      pieceComptaSave.numeroPiece = +this.numeroPiece;

    pieceComptaSave.periode = this.periode.typePeriodeComptable;
    pieceComptaSave.numeroJournal = this.journal.numero;
    pieceComptaSave.numeroPiece = +this.numeroPiece;
    pieceComptaSave.datePiece = this.datePiece.toUtc();
    pieceComptaSave.dateEcheance = this.dateEcheance.toUtc();
    pieceComptaSave.montantBase = +this.montantBase;
    pieceComptaSave.montantDevise = +this.montantDevise;
    pieceComptaSave.codeDevise = this.deviseSelected.id;
    pieceComptaSave.libelle = this.libelle;
    pieceComptaSave.typeCompte = this.typeCompte;
    pieceComptaSave.numeroCompte = +this.numeroCompteTier;
    pieceComptaSave.numeroCompteAssocie = +this.numeroCompteAchatVente;
    pieceComptaSave.montantEscompteBase = +this.montantEscompte * +this.taux
    pieceComptaSave.montantEscompteDevise = +this.montantEscompte;
    pieceComptaSave.codeBlocage = this.statutSelected.id;
    pieceComptaSave.pieceAcquittee = this.pieceAcquittee;
    pieceComptaSave.codeMouvement = this.journal.codeMouvement;
    pieceComptaSave.contreparties = [];
    let i = 1;
    this.contreparties.forEach(c => {
      let contr : PieceComptableContrepartieSaveDTO = new PieceComptableContrepartieSaveDTO();
      contr.typeCompte = c.typeCompte;
      contr.numeroCompte = c.numeroCompte;
      contr.libelle = c.libelle;
      contr.codeMouvement = c.codeMouvement;
      contr.montantDevise = c.montantDevise;
      contr.montantBase = c.montantBase;
      contr.codeDevise = c.codeDevise;
      contr.numeroCaseTVA = c.caseTva.numeroCase;
      contr.numeroLigne = i++;
      pieceComptaSave.contreparties.push(contr);
    });
    pieceComptaSave.hash = this.hash;
    return pieceComptaSave;
  }
  private GetModelForGrid(): EntetePieceComptable {
    let entete = new EntetePieceComptable();
    entete.codeJournal = this.journal.numero;
    entete.codePiece = +this.numeroPiece;
    entete.escompte = +this.montantEscompte;
    entete.libelle = this.libelle;
    entete.datePieceDate = this.datePiece;
    entete.dateEcheanceDate = this.dateEcheance;
    entete.status = this.statutSelected.id;
    entete.statusLibelle = this.statutSelected.libelle;
    entete.montant = +this.montantDevise;
    entete.numeroCompte = +this.numeroCompteTier;
    entete.nomCompte = this.compteTiersNom;
    entete.devise = this.deviseSelected.libelle;
    return entete;
  }

  private validateLibelle(){
    if(!this.piecereadonly && this.libelle){
      AchatVenteApi.ValidateLibelle(this.libelle,this.typeCompte,this.numeroCompteTier).then((isUsed) => {
        if(isUsed) this.libelleWarningMessage = "Attention, ce libellé est déjà utilisé par une autre pièce";
        else this.libelleWarningMessage = "";
     });
    } else this.libelleWarningMessage = "";
  }

  private cancelEdit(){
    this.piecereadonly = true;
    if(+this.numeroPiece != 0){
      this.closeDialog
    }else this.closeDialog();
  }

  private closeDialog(){
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
</style>
