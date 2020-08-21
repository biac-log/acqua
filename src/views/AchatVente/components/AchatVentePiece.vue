<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      scrollable
      width="2000"
      :persistent="!piecereadonly"
      eager
      @keydown.f2="ModifierPiece"
      @keydown.46.prevent.stop="DeletePiece"
      @keydown.107.prevent.stop="createContrepartie"
      @keydown.alt.enter="savePiece()"
      @click:outside.stop="closeDialog()" 
      @keydown.esc.stop="closeDialog()"
    >
      <v-form ref="form" v-model="isValid" lazy-validation autocomplete="off">
        <v-card :loading="pieceLoading">
          <v-toolbar color="primary" dark flat>
            <v-card-title class="d-flex justify-start">
              <p class="mb-0" v-if="numeroPiece">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
              <p class="mb-0" v-if="!numeroPiece">Nouvelle pièce</p>
              <p class="ml-10 mb-0 textMini">Période {{ periodeDisplay }}</p>
              <p class="ml-5 mb-0 textMini">Journal {{ journal.fullLibelle }}</p>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-tooltip v-if="piecereadonly" top open-delay=500>
              <template v-slot:activator="{ on }">
                <v-btn class="mr-5" color="success" :disabled="saveLoading" @click="ModifierPiece" v-on="on">
                  <v-icon left>mdi-pencil</v-icon>Modifier
                </v-btn>
              </template>
              <span>Modifier la pièce <span class="shortcutTooltip">F2</span></span>
            </v-tooltip>
            <v-tooltip top open-delay=500 open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn class="mr-10" color="error" :disabled="saveLoading" v-show="piecereadonly" @click="DeletePiece" :loading="deleteIsLoading" v-on="on" >
                  <v-icon left>mdi-delete</v-icon>Supprimer
                </v-btn>
              </template>
              <span>Supprimer la pièce <span class="shortcutTooltip">del</span></span>
            </v-tooltip>
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
          <v-progress-linear
            :active="pieceLoading"
            :indeterminate="pieceLoading"
            top
            color="primary accent-4"
          ></v-progress-linear>
          <v-card-text style="height: 750px;">
            <v-row >
              <v-col cols="5">
                <v-row dense>
                  <v-col cols="4">
                    <v-combobox
                      ref="autocompleteCompteTier"
                      label="Numéro compte tiers"
                      v-model="numeroCompteTierSelected"
                      :items="comptesTiersSearch"
                      :search-input.sync="searchCompteDeTier"
                      :rules="numeroCompteTierRules"
                      @keypress.enter="loadCompte"
                      @keyup.enter="$event.target.select()"
                      @focus="$event.target.select()"
                      @change="numeroCompteTierChange"
                      @keydown.ctrl.f.prevent="OpenSearchCompte()"
                      :hide-details="piecereadonly"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      hide-selected
                      item-text="nom"
                      item-value="numero"
                      hide-no-data
                    >
                      <template v-slot:append>
                        <v-tooltip top open-delay="500" open-on-hover>
                          <template v-slot:activator="{ on }">
                              <v-btn icon small v-show="!piecereadonly" v-on="on" :disabled="piecereadonly || saveLoading" @click="OpenSearchCompte()" @keydown.enter.prevent.stop="OpenSearchCompte()" tabindex="-1">
                                <v-icon>mdi-magnify</v-icon>
                              </v-btn>
                          </template>
                          <span>Rechercher un compte <span class="shortcutTooltip">CTRL+F</span></span>
                        </v-tooltip>
                      </template>
                      <template v-slot:selection="{ item }">
                        {{ item.numero }}
                      </template>
                      <template v-slot:item="{ item }">
                        {{ item.nom }}
                      </template>
                    </v-combobox>
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
                      autocomplete="off"
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
                  <v-col cols="4">
                    <v-text-field
                      ref="montant"
                      label="Montant"
                      v-model="montantDevise"
                      validate-on-blur
                      :rules="montantRules"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      @blur="montantDevise = montantDevise.toNumber().toDecimalString()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-select
                      :items="devises"
                      v-model="deviseSelected"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      :loading="devisesLoading"
                      tabindex="-1"
                      return-object
                      item-text="libelle"
                      label="Devise pièce"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Montant Escompte"
                      v-model="montantEscompte"
                      :rules="montantEscompteRules"
                      :filled="piecereadonly"
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      @blur="montantEscompte = montantEscompte.toNumber().toDecimalString()"
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      label="Taux devise"
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
                      :loading="statutsLoading"
                      return-object
                      item-value="id"
                      item-text="libelle"
                      label="Statut"
                      hide-details="auto"
                      tabindex="-1"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row dense>
                  <!-- <v-col cols="4">
                    <v-checkbox
                      label="Pièce acquitée"
                      v-model="pieceAcquittee"
                      :readonly="piecereadonly"
                      tabindex="-1"
                    ></v-checkbox>
                  </v-col> -->
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
                  :DatePiece.sync="datePiece"
                ></GridContreparties>
                <SearchCompteTier ref="compteDialog"></SearchCompteTier>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider v-if="!piecereadonly"></v-divider>
          <v-card-actions v-if="saveLoading || !piecereadonly" class="d-flex">
            <v-tooltip top open-delay=500 open-on-hover>
              <template v-slot:activator="{ on }">
              <v-btn
                color="error"
                class="ma-2 pr-4 align-self-start"
                text
                tabindex="-1"
                :disabled="saveLoading"
                v-if="numeroPiece"
                @click="DeletePiece()"
                :loading="deleteIsLoading"
                v-on="on"
                >
                Supprimer</v-btn
              >
              </template>
              <span>Supprimer la pièce <span class="shortcutTooltip">del</span></span>
            </v-tooltip>
            <v-spacer></v-spacer>
            <v-btn
              color="warning"
              class="ma-2 mt-0 pr-4 align-self-start"
              text
              tabindex="-1"
              v-if="!numeroPiece && !forcerNumero"
              :disabled="saveLoading"
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
            <v-tooltip top open-delay=500 open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn color="blue darken-1" class="ma-2 mt-0 pr-4 align-self-start" :disabled="saveLoading" tile outlined @click="cancelEdit()" tabindex="-1" v-on="on">
                  <v-icon left>mdi-close</v-icon> Annuler
                </v-btn>
              </template>
              <span>Annuler les modifications <span class="shortcutTooltip">esc</span></span>
            </v-tooltip>
            <v-tooltip top open-delay=500 open-on-hover>
              <template v-slot:activator="{ on }">
              <v-btn ref="btnValidate" class="ma-2 mt-0 pr-4 align-self-start" tile color="success" :loading="saveLoading" :disabled="!isValid"  @click="savePiece()" v-on="on">
                <v-icon left>mdi-content-save</v-icon>Sauvegarder
              </v-btn>
              </template>
              <span>Sauvegarder la pièce <span class="shortcutTooltip">alt + enter</span></span>
            </v-tooltip>
          </v-card-actions>
          <v-alert type="error" border="left" v-if="errorMessage"  class="ml-4 mr-4">
              {{errorMessage}}
          </v-alert>
          <Confirm ref="confirmDialog"></Confirm>
          <Confirm ref="confirmLibellelDialog" :displayButtonCancel="false" :focusOk="false"></Confirm>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import axios from "axios";
import moment from "moment";
import { Component, Vue, PropSync, Emit, Watch, Ref } from "vue-property-decorator";
import {
  PeriodeComptable,
  EntetePieceComptable,
  PieceComptable,
  PieceComptableContrepartie,
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
import { CompteDeTier } from '../../../models/Compte/CompteDeTier';
import CompteGeneralSearch from '../../../models/Compte/CompteGeneralSearch';
import { displayAxiosError } from '@/utils/ErrorMethods';
import * as DateMethods from '@/utils/DateMethods'
import { DateTime } from '../../../models/DateTime';
import { DeviseApi } from "@/api/DeviseApi";
import { Devise } from '@/models/Devise/Devise';
import { numberToString } from '@/utils/FiltersMethods';

@Component({
  name: "AchatVentePiece",
  components: { SearchCompteTier, GridContreparties, Confirm, DatePicker }
})
export default class extends Vue {
  @Ref() readonly autocompleteCompteTier!: HTMLInputElement;
  @Ref() readonly buttonSave!: HTMLButtonElement;
  @Ref() readonly gridContreparties!: GridContreparties;
  @Ref() readonly confirmDialog!: Confirm;

  public piecereadonly: boolean = true;
  private pieceLoading = false;
  private errorMessage: string = "";
  private contreparties: PieceComptableContrepartie[] = [];
  private isValid: boolean = true;
  //Titre
  private periode: PeriodeComptable = new PeriodeComptable();
  private periodeDisplay: string = "";
  private journal: Journal = new Journal();
  private numeroPiece: string = "";

  //Encodage
  private numeroCompteTier: string= "";
  private numeroCompteTierSelected: { numero: number | string, nom: string } = { numero: "", nom:"" };
  private numeroCompteTierRules: any = [(v: { numero: number | string }) => !!v?.numero || "Numéro obligatoire"];
  private comptesTiersSearch: { numero: number, nom: string }[] = [];
  private searchCompteDeTier: string = '';
  private libelleFromInit = "";
  private libelle: string = "";
  private libelleRules: any = [(v: string) => !!v || "Libellé obligatoire"];
  private libelleWarningMessage: string = "";
  private compteAssocieNumero:string = "";
  private compteAssocieNom:string = "";
  private montantDevise: string = "";
  private montantRules: any = [(v: string) => v.isDecimal(true) || "Montant invalide"];
  private montantEscompte: string = "";
  private montantEscompteRules: any = [(v: string) => v.isDecimal(false) || "Montant invalide"];
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

  mounted(){
    this.loadDevises();
    this.loadStatuts();
  }

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

  private forcerNumero: boolean = false;
  private numeroToForce: string = "";
  private numeroToForceRules: any = [(v: string) =>  !!v || "Numéro obligatoire", 
                                     (v: string) => !!v.toNumber() || "Numéro invalide"];

  private ventilleBase: number = 0;

  public openNew(periode: PeriodeComptable, journal: Journal): Promise<{ action: string, data: EntetePieceComptable}> {
    this.dialog= true;
    this.piecereadonly = false;
    this.init(periode, journal);

    let today = DateTime.today();
    if(today.isBefore(this.periode.dateDebut))
      this.datePiece = this.periode.dateDebut;
    else if(today.isAfter(this.periode.dateFin)) 
      this.datePiece = this.periode.dateFin;
    else this.datePiece = today;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.autocompleteCompteTier?.focus();
    });
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public open(entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal): Promise<{ action: string, data: EntetePieceComptable}> {
    this.dialog=true;
    this.piecereadonly=true;
    this.init(periode, journal, entete);
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.autocompleteCompteTier?.focus();
    });
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

	private init(periode: PeriodeComptable, journal: Journal, entete?: EntetePieceComptable) {
    this.journal = journal;
    this.periode = periode;
    this.periodeDisplay = periode.libellePeriodeFull;
    this.typeCompte = journal.typeCompteChar;
    if(entete){
      this.numeroPiece = entete.codePiece ? entete.codePiece.toString() : "";
      this.GetPiece();
    }
  }

  private resetForm(){
    this.errorMessage = "";
    this.libelleWarningMessage = "";
    this.forcerNumero = false;
    this.numeroToForce = "";

    this.comptesTiersSearch= [];
    this.searchCompteDeTier = "";
    this.numeroCompteTierSelected = { numero: '', nom: '' };
    
    this.periodeDisplay = "";
    this.journal = new Journal();
    this.numeroPiece= "";
    this.numeroCompteTier= "";
    this.libelle= "";
    this.libelleFromInit = "";
    this.montantDevise= "";
    this.montantEscompte= "";
    this.deviseSelected = this.devises[0];
    this.statutSelected = this.statuts[0];
    this.datePiece = new DateTime();
    this.dateEcheance = new DateTime();
    this.typeCompte= "";
      
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
    this.compteAssocieNumero = "";
    this.compteAssocieNom = "";
    this.hash = "";
    (this.$refs.form as any).resetValidation();
  }

  private async GetPiece() {
    this.errorMessage = "";
    this.pieceLoading = true;
    try {
      let pieceComptable = await AchatVenteApi.getPieceComptable(this.journal.numero, this.numeroPiece);
      this.SetPiece(pieceComptable);
    } catch(err) {
      this.errorMessage = displayAxiosError(err);
    }finally{
      this.pieceLoading = false;
    }
  }

  private SetPiece(pieceComptable: PieceComptable) {
    this.contreparties = pieceComptable.contreparties;

    this.numeroCompteTier = pieceComptable.compteTiersNumero.toString();
    this.libelle = pieceComptable.libelle;
    this.libelleFromInit = pieceComptable.libelle;

    if(pieceComptable){
      let compteToSelect = {numero:pieceComptable.compteTiersNumero, nom:pieceComptable.compteTiersNom };
      this.comptesTiersSearch = [];
      this.comptesTiersSearch.push(compteToSelect);
      this.numeroCompteTierSelected = compteToSelect;
    }

    this.datePiece = new DateTime(pieceComptable.datePiece);
    this.dateEcheance = new DateTime(pieceComptable.dateEcheance);

    this.montantDevise = pieceComptable.montantDevise.toDecimalString(2);
    this.montantBase = pieceComptable.montantBase.toDecimalString(2);
    this.montantEscompte = pieceComptable.montantEscompteDevise.toDecimalString(2);
    this.compteTiersNom = pieceComptable.compteTiersNom;
    this.libellePiece = pieceComptable.libelle;
    this.taux = pieceComptable.taux.toDecimalString(6);
    this.pieceAcquittee = pieceComptable.pieceAcquittee;
    this.libelleMontantBase = pieceComptable.libelleMontantBase;
    this.libelleSoldeCompteTiers = pieceComptable.libelleSoldeCompteTiers;
    this.delaiPaiementLibelle = pieceComptable.delaiPaiementLibelle;
    this.compteTiersEscomptePourcentage = pieceComptable.compteTiersEscomptePourcentage;
    this.compteTiersEscompteNombreJours = pieceComptable.compteTiersEscompteNombreJours;
    this.codeTaxe = pieceComptable.compteTiersCodeTaxe;
    this.libelleCompteAssocie = pieceComptable.libelleCompteAssocie;
    this.numeroCompteAchatVente = pieceComptable.compteVenteAchatNumero.toDecimalString(2);
    this.libelleCompteVenteAchat = pieceComptable.libelleCompteVenteAchat;
    this.compteAssocieNom = pieceComptable.compteAssocieNom;
    this.compteAssocieNumero = pieceComptable.compteAssocieNumero;

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
        this.setCompteDeTier();
        this.$nextTick(() => this.autocompleteCompteTier?.focus());
      })
      .finally(() => {
        this.compteLoading = false;
      });
    }
  }

  private OpenSearchCompte(): void {
    if(this.piecereadonly) return;
    this.autocompleteCompteTier.blur();
    (this.$refs.compteDialog as SearchCompteTier)
      .open(this.typeCompte)
      .then(compte => {
        this.numeroCompteTier = compte.numero.toString();
        this.loadCompte();
        this.$nextTick(() => (this.$refs.libellePiece as any)?.focus());
      }).catch(() => {
        this.$nextTick(() => this.autocompleteCompteTier?.focus());
      });
  }

  @Watch("searchCompteDeTier")
  private async searchCompteDeTierChanged(matchCode: string){
    try {
      if(matchCode && !matchCode.toNumber()){
        this.compteLoading = true;
        this.comptesTiersSearch = await CompteApi.searchCompteDeTier(this.typeCompte, matchCode.toUpperCase(), 5);
      }
      else this.comptesTiersSearch = [];
    } catch (err) {
      
    }finally{
      this.compteLoading = false;
    }
  }
  private numeroCompteTierChange(value: string | CompteSearch){
    
    if(typeof value === "string"){
      this.numeroCompteTier = value;
    }
    else if(value instanceof CompteSearch)
    {
      this.numeroCompteTier = value.numero.toString();
      this.$nextTick(() => this.autocompleteCompteTier?.blur());
      this.$nextTick(() => (this.$refs.libellePiece as any)?.focus());
    }
    else {
      this.numeroCompteTier = "";
      this.compteTiersNom = "";
    }
    this.loadCompte();
  }

  private async setCompteDeTier(compte?: CompteDeTier) {
    if(compte){
      let compteToSelect = {numero:compte.numero, nom:compte.nom };
      this.comptesTiersSearch = [];
      this.comptesTiersSearch.push(compteToSelect);
      this.numeroCompteTierSelected = compteToSelect;
    }

    this.numeroCompteTier = compte ? compte.numero.toString() : "";
    this.compteTiersNom = compte ?  compte.nom : "";
    this.deviseSelected = compte ? this.getDeviseToSelect(new Devise({id: compte.codeDevise, libelle: compte.libelleDevise, typeDevise: "D"})) : this.devises[0];
    this.libelleSoldeCompteTiers = compte ? compte.libelleSoldeCompteTiers: "";
    this.compteTiersEscomptePourcentage = compte ? compte.escomptePourcentage.toDecimalString(2): "";
    this.compteTiersEscompteNombreJours = compte ? compte.escompteNombreJours.toDecimalString(2): "";
    this.libelleCompteAssocie = compte ? compte.libelleCompteAssocie: "";
    this.numeroCompteAchatVente = compte ? compte.compteVenteAchatNumero.toString(): "";
    this.libelleCompteVenteAchat = compte ? compte.libelleCompteVenteAchat : "";
    this.delaiPaiementLibelle = compte ? compte.delaiPaiementLibelle : "";
    this.codeTaxe = compte ? compte.codeTaxe : 0;
    this.compteAssocieNumero = compte ? compte.compteAssocieNumero.toString() : "";
    this.compteAssocieNom = compte ? compte.compteAssocieNom : "";
    this.initDateEcheance(this.numeroCompteTier, this.typeCompte, this.datePiece);
  }

  private validateLibelle(){
    if(!this.piecereadonly && this.libelle && this.libelle != this.libelleFromInit){
      AchatVenteApi.ValidateLibelle(this.libelle, this.typeCompte, this.numeroCompteTier).then((isUsed) => {
        if(isUsed){
          this.libelleWarningMessage = "Attention, ce libellé est déjà utilisé par une autre pièce";
          (this.$refs.confirmLibellelDialog as Confirm).open("Attention",
            `Attention, ce libellé est déjà utilisé par une autre pièce`,
            "error",
            "J'ai compris"
          ).then(() => { this.$nextTick(() => (this.$refs.montant as any)?.focus()); });
        } 
        else this.libelleWarningMessage = "";
     });
    } else this.libelleWarningMessage = "";
  }

  private async ModifierPiece() {
    this.piecereadonly = false;
    await this.loadCompte();
    this.$nextTick(() => this.autocompleteCompteTier?.focus());
  }

  private devisesLoading = false;
  private async loadDevises() {
    try {
      if(this.devises.length <= 1){
        this.devisesLoading = true;
        this.devises = await DeviseApi.getAllDevises();
      }
    } catch (err) {
      
    }finally{
      this.devisesLoading = false;
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

  private statutsLoading = false;
  private async loadStatuts(){
    try {
      if(this.statuts.length <= 1){
        this.statutsLoading = true;
        this.statuts = await AchatVenteApi.getAllStatut();
        this.statutSelected = this.statuts[0];
      }
    }catch (err) {
      
    }finally{
      this.statutsLoading = false;
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
      if(this.deviseSelected) this.initTauxDevise(this.deviseSelected.id, val);
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
      this.taux = "1,000000";
    else if(this.datePiece.isValid() && numeroDevise) {
      this.taux = "0,890000";
      // DeviseApi.getTaux(numeroDevise, datePiece)
      // .then((resp) => {
      //   this.taux = resp.toDecimalString(6);
      // }).catch((err) => {
      //   this.errorMessage = displayAxiosError(err);
      // });
    }
    this.recalculmontantBase();
  }

  @Watch("montantDevise")
  private montantDeviseChanged(val: string, oldVal: string){
    if(!this.piecereadonly)
      this.recalculmontantBase();
  }

  @Watch("deviseSelected")
  private deviseSelectedChanged(val: Devise, oldVal: Devise){
    if(!this.piecereadonly && val && this.datePiece.isValid()){
      this.initTauxDevise(this.deviseSelected.id, this.datePiece);

    }
  }

  private recalculmontantBase(){
    if(this.piecereadonly) return;

    if(this.taux.isDecimal(true) && this.montantDevise.isDecimal(true)){
      this.montantBase = (this.montantDevise.toNumber() * this.taux.toNumber()).toDecimalString(2);
      this.libelleMontantBase = `${this.montantBase} EUR`;
    }
    else{
      this.montantBase = "";
      this.libelleMontantBase = "";
    }
  }

  private createContrepartie(){
    if(this.compteTiersNom)
      this.gridContreparties.createContrepartie();
  }

  private saveLoading: boolean = false;
  private async savePiece() {
    (this.$refs.form as any).validate();
    this.$nextTick(async () => {
      if (this.isValid && await this.confirmEquilibre()) {
        let pieceToSave = this.GetModelToSave();
        if(pieceToSave.numeroPiece == 0)
          this.addPiece(pieceToSave);
        else 
          this.updatePiece(pieceToSave);
      }
    })
  }

  private async confirmEquilibre(): Promise<boolean>{
    try {
      if(!this.gridContreparties.pieceIsEquilibre())
        return await (this.$refs.confirmDialog as Confirm).open( "Attention, pièce non équilibrée", `La pièce n'est pas équilibrée, voulez vous sauvegarder ?`, "error", "Sauvegarder");
      else if(this.gridContreparties.errorInTVA())
        return await (this.$refs.confirmDialog as Confirm).open( "Attention, contrôle de tva", `La tva calculée est différente de la tva assignée, voulez-vous continuer ?`, "error", "Sauvegarder");
      return true;
    } catch (err) {
      return false;
    }
  }

  private addPiece(piece: PieceComptableSaveDTO) {
    this.saveLoading = true;
    this.piecereadonly = true;
    this.errorMessage = "";
    AchatVenteApi.AddPiece(piece).then((numeroPiece) => {
      this.numeroPiece = numeroPiece.toString();
      this.resolve({ action: "ADD", data: this.GetModelForGrid()});
      (this.$refs.form as any).resetValidation();
      this.dialog = false;
      this.resetForm();
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
      this.resetForm();
    }).catch((err) => {
        this.errorMessage = displayAxiosError(err);
        this.piecereadonly = false;
    }).finally(()=> {
      this.saveLoading = false;
    });
  }

  private deleteIsLoading : boolean = false;
  private DeletePiece() {
    this.autocompleteCompteTier?.blur();
    this.$nextTick(() => this.OpenConfirmDelete());
  }
  private OpenConfirmDelete() {
    this.confirmDialog.open(
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
        }else {
          this.$nextTick(() => this.autocompleteCompteTier?.focus());
        }
      }).catch(() => {
        this.$nextTick(() => this.autocompleteCompteTier?.focus());
      });
  }

  private GetModelToSave(): PieceComptableSaveDTO {
    let pieceComptaSave: PieceComptableSaveDTO = new PieceComptableSaveDTO();
    if(this.forcerNumero && this.numeroToForce)
      pieceComptaSave.numeroPiece = +this.numeroPiece;

    pieceComptaSave.periode = this.periode.typePeriodeComptable;
    pieceComptaSave.numeroJournal = this.journal.numero;
    pieceComptaSave.numeroPiece = this.numeroPiece.toNumber();
    pieceComptaSave.datePiece = this.datePiece.toUtc();
    pieceComptaSave.dateEcheance = this.dateEcheance.toUtc();
    pieceComptaSave.montantBase = this.montantBase.toNumber();
    pieceComptaSave.montantDevise = this.montantDevise.toNumber();
    pieceComptaSave.codeDevise = this.deviseSelected.id;
    pieceComptaSave.libelle = this.libelle;
    pieceComptaSave.typeCompte = this.typeCompte;
    pieceComptaSave.numeroCompte = this.numeroCompteTier.toNumber();
    pieceComptaSave.numeroCompteAssocie = this.compteAssocieNumero.toNumber();
    pieceComptaSave.montantEscompteBase = this.montantEscompte.toNumber() * this.taux.toNumber();
    pieceComptaSave.montantEscompteDevise = this.montantEscompte.toNumber();
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
    entete.codePiece = this.numeroPiece.toNumber();
    entete.escompte = this.montantEscompte.toNumber();
    entete.libelle = this.libelle;
    entete.datePieceDate = this.datePiece;
    entete.dateEcheanceDate = this.dateEcheance;
    entete.status = this.statutSelected.id;
    entete.statusLibelle = this.statutSelected.libelle;
    entete.montant = this.montantDevise.toNumber();
    entete.numeroCompte = this.numeroCompteTier.toNumber();
    entete.nomCompte = this.compteTiersNom;
    entete.devise = this.deviseSelected.libelle;
    entete.isEquilibre = this.gridContreparties.pieceIsEquilibre();
    return entete;
  }

  private cancelEdit(){
    this.piecereadonly = true;
    if(this.numeroPiece.toNumber() == 0)
     {
       this.$nextTick(() => {
          this.confirmDialog
          .open(
            "Annuler",
            `Êtes-vous sur de vouloir annuler  ?`,
            "warning",
            "Annuler la création"
          )
          .then((resp) => {
            if (resp) {
              this.closeDialog();
            }else {
              this.$nextTick(() => this.autocompleteCompteTier?.focus());
            }
          }).catch(() => {
             this.$nextTick(() => this.autocompleteCompteTier?.focus());
          });
       });
     }
  }

  private closeDialog(){
    this.resetForm();
    this.autocompleteCompteTier?.blur();
    this.$nextTick(() => {
      this.dialog = false;
      this.reject();
    });
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
