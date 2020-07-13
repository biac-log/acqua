<template>
  <v-dialog
    v-model="dialog"
    scrollable
    width="2000"
    eager
    @keydown.f2="ModifierPiece"
    @keydown.46.prevent.stop="DeletePiece"
    @keydown.107.prevent.stop="CreateExtrait"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <p class="mb-0" v-if="numeroPiece">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
            <p class="mb-0" v-else>Nouvelle pièce</p>
            <p class="ml-10 mb-0 textMini">{{ periode.typePeriodeComptableLibelle }}</p>
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
          <v-row fill-height>
            <v-col cols="12" x-lg="5" lg="12">
              <v-row dense>
                <v-col cols="4">
                  <v-text-field
                    v-model="libelleCompte"
                    label="Compte"
                    filled
                    readonly
                    tabindex="-1"
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Solde initial"
                    v-model="soldeInitial"
                    :rules="numberRules"
                     filled
                    readonly
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    label="Solde actuel"
                    v-model="soldeActuel"
                    :rules="numberRules"
                    filled
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
            <v-col cols="12" x-lg="7" lg="12">
              <ExtraitsVue
                ref="gridExtraits"
                :Journal.sync="journal"
                :Extraits.sync="extraits"
                :IsReadOnly.sync="readonly"
              ></ExtraitsVue>
            </v-col>
          </v-row>
        </v-card-text>
        <!-- <v-divider v-if="!readonly"></v-divider>
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
        </v-card-actions> -->
        <v-alert type="error" border="left" v-if="errorMessage"  class="ml-4 mr-4">
            {{errorMessage}}
        </v-alert>
        <!-- <Confirm ref="confirmDialog"></Confirm> -->
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

@Component({
  name: "PieceComptableVue",
  components: { ExtraitsVue, DatePicker}
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
  private numberRules: any = [(v: string) => v.isDecimal(true)  || "Montant invalide"];

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

  private init(piece: Piece){
    this.numeroPiece = piece.numeroPiece.toString();
    this.libelleCompte = `${piece.numeroCompteFinancier.toString()} ${piece.nomCompteFinancier}`; 
    this.datePiece = new DateTime(piece.datePiece);
    this.soldeInitial = piece.soldeInitial.toDecimalString(2);
    this.extraits = piece.extraits;
    this.hash = piece.hash;
  }

  private resetForm(){
    this.errorMessage = "";
    this.periode = new PeriodeComptable();
    this.journal = new Journal();
    this.libelleCompte = "";
    this.datePiece = new DateTime();
    this.extraits = [];
    this.soldeInitial = "";
    this.soldeActuel = "";
  }

  private loadCompte(){

  }

  private DeletePiece(){

  }

  private CreateExtrait(){
    (this.$refs.gridExtraits as ExtraitsVue).createExtrait();
  }

  private ModifierPiece(){
    this.readonly = false;
    (this.$refs.refDatePiece as DatePicker).focus();
  }

  private closeDialog(){
    this.resetForm();
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
