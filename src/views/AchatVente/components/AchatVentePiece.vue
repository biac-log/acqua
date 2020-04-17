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
                    ref="numeroCompte"
                    v-model="numeroCompte"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    :append-icon="piecereadonly ? '' : 'mdi-magnify'"
                    :rules="numeroCompteTierRules"
                    @keypress.enter="loadCompte"
                    @keyup.enter="$event.target.select()"
                    @click:append="OpenSearchCompte()"
                    @focus="$event.target.select()"
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
                    readonly
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    label="Libelle"
                    ref="libellePiece"
                    :value="libellePiece"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    hide-details
                    v-model="libelle"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="2">
                  <v-select
                    :items="devises"
                    v-model="deviseSelected"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    return-object
                    item-text="libelle"
                    label="Devise pièce"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Montant"
                    v-model="montant"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Montant Escompte"
                    v-model="montantEscompte"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    hide-details
                  ></v-text-field>
                </v-col>

                <v-col cols="2">
                  <v-text-field
                    label="Taux"
                    v-model="taux"
                    :filled="piecereadonly"
                    readonly
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <DatePicker
                    label="Date pièce"
                    :date.sync="datePiece"
                    :readonly.sync="piecereadonly"
                  ></DatePicker>
                </v-col>
                <v-col cols="4">
                  <DatePicker
                    label="Date échéance"
                    :date.sync="dateEcheance"
                    :readonly.sync="piecereadonly"
                  ></DatePicker>
                </v-col>
                <v-col cols="4">
                  <v-select
                    :items="statuts"
                    v-model="statutSelected"
                    :filled="piecereadonly"
                    :readonly="piecereadonly"
                    item-value="id"
                    item-text="libelle"
                    label="Statut"
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <v-checkbox
                    label="Pièce acquitée"
                    v-model="pieceAcquittee"
                    readonly
                    tabindex="-1"
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
                :MontantDevise.sync="montant"
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
        <v-card-actions v-if="!piecereadonly">
          <v-spacer></v-spacer>
          <v-btn class="mr-10" color="warning" @click="ModifierPiece">
            <v-icon left>mdi-content-save</v-icon>Sauvegarder
          </v-btn>
        </v-card-actions>
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
  Journal
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

@Component({
  name: "AchatVentePiece",
  components: { SearchCompteTier, GridContreparties, Confirm, DatePicker }
})
export default class extends Vue {
  public piecereadonly: boolean = true;
  private contreparties: PieceComptableContrepartie[] = [];
  private isValid: boolean = true;
  //Titre
  private periodeDisplay: string = "";
  private journal: Journal = new Journal();
  private numeroPiece: string = "";

  //Encodage
  private numeroCompte: string = "";
  private libelle: string = "";
  private montant: string = "";
  private montantEscompte: string = "0";
  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();
  private statuts: Statut[] = [];
  private statutSelected: Statut = new Statut();
  private datePiece: Date = new Date();
  private dateEcheance: Date = new Date();

  public typeCompte: string = "";
  private isEdit: boolean = false;

  private numeroCompteTier: string = "";
  private numeroCompteTierRules: any = [(v: string) => !!v || "Numéro obligatoire",(v: string) => !!+v || "Numéro invalide"];

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

  private resolve!: any;
  private reject!: any;

  public async openNew(periode: PeriodeComptable, journal: Journal): Promise<EntetePieceComptable> {
    this.dialog= true;
    this.piecereadonly = false;
    await this.loadDataForEdit();
    this.init(periode, journal);
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public open(entete: EntetePieceComptable,
    periode: PeriodeComptable,
    journal: Journal): Promise<EntetePieceComptable> {
    this.dialog=true;
    this.$nextTick(() => (this.$refs.numeroCompte as any).focus());
    this.piecereadonly=true;
    this.init(periode,journal,entete);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

	private init(periode: PeriodeComptable, journal: Journal, entete?: EntetePieceComptable) {
    this.resetForm();
    this.journal = journal;
    this.periodeDisplay = periode.libellePeriodeFull;
    this.typeCompte = journal.typeCompteChar;
    if(entete){
      this.numeroPiece = entete.codePiece ? entete.codePiece.toString() : "";
      this.GetData();
    }
  }
  
  private async loadDataForEdit(){
    await this.loadDevises();
    await this.loadStatuts();
  }

   private resetForm(){
    this.periodeDisplay = "";
    this.journal = new Journal();
    this.numeroPiece= "";
    this.numeroCompte= "";
    this.libelle= "";
    this.montant= "";
    this.montantEscompte= "";
    this.deviseSelected = this.devises[0];
    this.statutSelected = this.statuts[0];
    this.datePiece = new Date();
    this.dateEcheance = new Date();
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
  }

  private GetData() {
    AchatVenteApi.getPieceComptable(this.journal.numero, this.numeroPiece)
      .then(pieceComptable => {
        this.SetDisplayData(pieceComptable);
      })
      .catch(error => {})
      .finally(() => {});
  }

  private SetDisplayData(pieceComptable: PieceComptable) {
    this.contreparties = pieceComptable.contreparties;

    this.numeroCompte = pieceComptable.compteTiersNumero.toString();
    this.libelle = pieceComptable.libelle;
    this.datePiece = pieceComptable.datePieceDate;
    this.dateEcheance = pieceComptable.dateEcheanceDate;

    this.montant = pieceComptable.montantDevise.toString();
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
  }

  private compteLoading: boolean = false;
  private loadCompte() {
    this.compteLoading = true;
    if(+this.numeroCompte){
      CompteApi.getCompteDeTier(this.typeCompte, this.numeroCompte.toString())
      .then(compte => {
        this.setCompteDeTier(compte);
      }).catch((err) => {
        this.setCompteDeTier()
        this.$nextTick(() => (this.$refs.numeroCompte as any).focus());
      })
      .finally(() => {
        this.compteLoading = false;
      });
    }
  }

  private OpenSearchCompte(): void {
    (this.$refs.compteDialog as SearchCompteTier)
      .open(this.typeCompte)
      .then(compte => {
        this.numeroCompte = compte.numero.toString();
        this.loadCompte();
        this.$nextTick(() => (this.$refs.libellePiece as any).focus());
      }).catch(() => {
        this.$nextTick(() => (this.$refs.numeroCompte as any).focus());
      });
  }
  private async setCompteDeTier(compte?: CompteDeTier) {
    this.numeroCompte = compte ? compte.numero.toString() : "";
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
  }

  private async ModifierPiece() {
    await this.loadDataForEdit();
    this.piecereadonly = false;
    this.$nextTick(() => (this.$refs.numeroCompte as any).focus());
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

  private DeletePiece() {
    (this.$refs.confirmDialog as Confirm)
      .open(
        "Suppression",
        `Êtes-vous sur de vouloir supprimer la piece ${this.journal.numero}.${this.numeroPiece} ?`,
        "error",
        "Supprimer"
      )
      .then(resp => {
        if (resp) console.log("DELETE");
      });
  }

  @Watch("datePiece")
  private datePieceChanged(val: Date, oldVal: Date) {
    if (!this.piecereadonly && val.getTime() != oldVal.getTime()) {
      if(this.numeroCompte && this.typeCompte){
        AchatVenteApi.getDateEcheance(
          this.typeCompte,
          this.numeroCompte,
          val
        ).then(dateEcheance => {
          this.dateEcheance = dateEcheance;
        });
      }

      if(!this.deviseSelected || this.deviseSelected.id == 1)
        this.taux = "1";
      else {
        AchatVenteApi.getTaux(this.deviseSelected.id, this.datePiece)
        .then((resp) => {
          this.taux = resp.toFixed(2);
        });
      }
    }
  }

  @Watch("montant")
  private montantChanged(val: string, oldVal: string){
    if(!this.piecereadonly)
      this.recalculmontantBase();
  }

  @Watch("deviseSelected")
  private deviseSelectedChanged(val: Devise, oldVal: Devise){
    if(!this.piecereadonly && val){
      AchatVenteApi.getTaux(this.deviseSelected.id, this.datePiece)
      .then((resp) => {
        this.taux = resp.toFixed(2);
      });
    }
  }

  private recalculmontantBase(){
    if(+this.taux && +this.montant){
      this.montantBase = (Number.parseFloat(this.montant) * Number.parseFloat(this.taux)).toFixed(2);
      this.libelleMontantBase = `${this.montantBase} ${this.deviseSelected.libelle}`;
    }
    else{
      this.montantBase = "";
      this.libelleMontantBase = "";
    }
  }

  private createContrepartie(){
    (this.$refs.gridContreparties as GridContrepartiesVue).createContrepartie();
  }

  @Emit("saveAction")
  private save() {
    
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
</style>
