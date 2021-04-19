<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      scrollable
      width="2000"
      :persistent="!piecereadonly"
      eager
      @keydown.f2="ModifierPiece"
      @keydown.107.prevent.stop="createContrepartie"
      @keydown.alt.enter="savePiece()"
      @click:outside.stop="clickOutside"
      @keydown.esc.stop="closeDialog()"
    >
      <v-form ref="form" v-model="isValid" lazy-validation autocomplete="off">
        <v-card :loading="pieceLoading">
          <v-toolbar color="primary" dark flat>
            <v-card-title class="d-flex justify-start">
              <p class="mb-0" v-if="numeroPiece">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
              <p class="mb-0" v-if="!numeroPiece">
                Nouvelle pièce - {{ journal.numero }}.{{ journal.numeroDernierePiece + 1 }}
              </p>
              <p class="ml-10 mb-0 textMini d-sm-none d-lg-flex">Période {{ periodeDisplay }}</p>
              <p class="ml-5 mb-0 textMini d-sm-none d-lg-flex">Journal {{ journal.fullLibelle }}</p>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-tooltip v-if="piecereadonly" top open-delay="500">
              <template v-slot:activator="{ on }">
                <v-btn
                  ref="refButtonModifier"
                  class="mr-5"
                  color="success"
                  :disabled="saveLoading"
                  @click="ModifierPiece"
                  v-on="on"
                >
                  <v-icon left>mdi-pencil</v-icon>Modifier
                </v-btn>
              </template>
              <span>Modifier la pièce <span class="shortcutTooltip">F2</span></span>
            </v-tooltip>
            <v-tooltip top open-delay="500" open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn
                  class="mr-10"
                  color="error"
                  :disabled="saveLoading"
                  v-show="piecereadonly"
                  @click="deletePiece"
                  :loading="deleteIsLoading"
                  v-on="on"
                >
                  <v-icon left>mdi-delete</v-icon>Supprimer
                </v-btn>
              </template>
              <span>Supprimer la pièce <span class="shortcutTooltip">del</span></span>
            </v-tooltip>
            <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-progress-linear
            :active="pieceLoading"
            :indeterminate="pieceLoading"
            top
            color="primary accent-4"
          ></v-progress-linear>
          <v-card-text style="height: 750px">
            <v-row>
              <v-col lg="5" sm="12">
                <v-row dense>
                  <v-col cols="6">
                    <autocomplete-comptes-vue
                      ref="autocompleteCompteTier"
                      label="Compte de tiers"
                      @change="numeroCompteTierChange"
                      :hide-details.sync="piecereadonly"
                      :readonly.sync="piecereadonly"
                      :rules.sync="numeroCompteTierRules"
                      :typeCompte.sync="typeCompte"
                      outlined
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Libellé"
                      ref="libellePiece"
                      autocomplete="off"
                      counter
                      maxlength="23"
                      v-model="libelle"
                      :value="libellePiece"
                      outlined
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
                      outlined
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      @blur="montantDevise = montantDevise.toNumber().toDecimalString()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      :items="devises"
                      v-model="deviseSelected"
                      outlined
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      :loading="devisesLoading"
                      tabindex="-1"
                      return-object
                      item-text="libelle"
                      label="Devise pièce"
                      :suffix="deviseSelected.libelle ? taux : ''"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Montant Escompte"
                      v-model="montantEscompte"
                      :rules="montantEscompteRules"
                      outlined
                      :readonly="piecereadonly"
                      :hide-details="piecereadonly"
                      @blur="montantEscompte = montantEscompte.toNumber().toDecimalString()"
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
                      outlined
                    ></DatePicker>
                  </v-col>
                  <v-col cols="4">
                    <DatePicker
                      label="Date échéance"
                      :date.sync="dateEcheance"
                      :readonly.sync="piecereadonly"
                      :rules.sync="dateEcheanceRules"
                      outlined
                      ref="refDateEcheance"
                    ></DatePicker>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="statutSelected"
                      :items="statuts"
                      outlined
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
                      outlined
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="d-lg-none d-xl-none">
                    <v-text-field
                      label="Période"
                      v-model="periodeDisplay"
                      outlined
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="d-lg-none d-xl-none">
                    <v-text-field
                      label="Journal"
                      v-model="journal.fullLibelle"
                      outlined
                      readonly
                      tabindex="-1"
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
                      outlined
                      readonly
                      tabindex="-1"
                      hide-details
                      :suffix="libelleSoldeCompteTiers != 0 ? 'EUR' : ''"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Délai de paiement"
                      v-model="delaiPaiementLibelle"
                      outlined
                      readonly
                      tabindex="-1"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="% Escompte"
                      v-model="compteTiersEscomptePourcentage"
                      outlined
                      readonly
                      tabindex="-1"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Nombre jours escompte"
                      v-model="compteTiersEscompteNombreJours"
                      outlined
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
                      outlined
                      readonly
                      tabindex="-1"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Compte achat/vente"
                      v-model="libelleCompteVenteAchat"
                      outlined
                      readonly
                      tabindex="-1"
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col lg="7" sm="12">
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
            <v-tooltip top open-delay="500" open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn
                  color="error"
                  class="ma-2 pr-4 align-self-start"
                  text
                  tabindex="-1"
                  :disabled="saveLoading"
                  v-if="numeroPiece"
                  @click="deletePiece()"
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
            <v-tooltip top open-delay="500" open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn
                  color="blue darken-1"
                  class="ma-2 mt-0 pr-4 align-self-start"
                  :disabled="saveLoading"
                  tile
                  outlined
                  @click="cancelEdit()"
                  tabindex="-1"
                  v-on="on"
                >
                  <v-icon left>mdi-close</v-icon> Annuler
                </v-btn>
              </template>
              <span>Annuler les modifications <span class="shortcutTooltip">esc</span></span>
            </v-tooltip>
            <v-tooltip top open-delay="500" open-on-hover>
              <template v-slot:activator="{ on }">
                <v-btn
                  ref="btnValidate"
                  class="ma-2 mt-0 pr-4 align-self-start"
                  tile
                  color="success"
                  :loading="saveLoading"
                  :disabled="!isValid"
                  @click="savePiece()"
                  v-on="on"
                >
                  <v-icon left>mdi-content-save</v-icon>Sauvegarder
                </v-btn>
              </template>
              <span>Sauvegarder la pièce <span class="shortcutTooltip">alt + enter</span></span>
            </v-tooltip>
          </v-card-actions>
          <v-alert type="error" border="left" v-if="errorMessage" class="ml-4 mr-4">
            {{ errorMessage }}
          </v-alert>
          <Confirm ref="confirmDialog"></Confirm>
          <Confirm ref="confirmLibellelDialog" :displayButtonCancel="false" :focusOk="false"></Confirm>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import {
  PeriodeComptable,
  EntetePieceComptable,
  PieceComptable,
  PieceComptableContrepartie,
  Statut,
  Journal,
  PieceComptableContrepartieSaveDTO,
  PieceComptableSaveDTO,
} from '@/models/AchatVente';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import SearchCompteTier from './SearchCompteTier.vue';
import Confirm from '@/components/Confirm.vue';
import DatePicker from '@/components/DatePicker.vue';
import CompteApi from '@/api/CompteApi';
import AchatVenteApi from '@/api/AchatVenteApi';
import GridContreparties from './GridContreparties.vue';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { DateTime } from '@/models/DateTime';
import DeviseApi from '@/api/DeviseApi';
import { Devise } from '@/models/Devise/Devise';
import { DialogActionResult } from '@/models/DialogResult';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';

@Component({
  name: 'AchatVentePiece',
  components: { SearchCompteTier, GridContreparties, Confirm, DatePicker, AutocompleteComptesVue },
})
export default class extends Vue {
  @Ref() readonly autocompleteCompteTier!: AutocompleteComptesVue;
  @Ref() readonly refButtonModifier!: HTMLButtonElement;
  @Ref() readonly buttonSave!: HTMLButtonElement;
  @Ref() readonly gridContreparties!: GridContreparties;
  @Ref() readonly confirmDialog!: Confirm;
  @Ref() readonly refDateEcheance!: DatePicker;

  public piecereadonly = true;
  private pieceLoading = false;
  private errorMessage = '';
  private contreparties: PieceComptableContrepartie[] = [];
  private isValid = true;
  //Titre
  private periode: PeriodeComptable = new PeriodeComptable();
  private periodeDisplay = '';
  private journal: Journal = new Journal();
  private numeroPiece = '';

  //Encodage
  private numeroCompteTier = '';
  private numeroCompteTierSelected: { numero: number | string; nom: string } = {
    numero: '',
    nom: '',
  };

  private oldPiece: PieceComptable = new PieceComptable();

  private numeroCompteTierRules: any = [(v: any) => !!v || 'Numéro obligatoire'];
  private libelleFromInit = '';
  private libelle = '';
  private libelleRules: any = [(v: string) => !!v || 'Libellé obligatoire'];
  private libelleWarningMessage = '';
  private compteAssocieNumero = 0;
  private compteAssocieNom = '';
  private montantDevise = '';
  private montantRules: any = [(v: string) => v.isDecimal(true) || 'Montant invalide'];
  private montantEscompte = '';
  private montantEscompteRules: any = [(v: string) => v.isDecimal(false) || 'Montant invalide'];
  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();
  private statuts: Statut[] = [];
  private statutSelected: Statut = new Statut();

  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [
    (v: string) => !!v || 'Date obligatoire',
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDatePiece(v) || 'La date est hors période',
  ];

  private dateEcheance: DateTime | null = null;
  private dateEcheanceRules: any = [
    (v: string) => !!v || 'Date obligatoire',
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDateEcheance(v),
  ];

  mounted() {
    this.loadDevises();
    this.loadStatuts();
  }

  private validateDatePiece(date: string): boolean {
    const dateTime = new DateTime(date);
    return dateTime.isBetween(this.periode.dateDebut, this.periode.dateFin);
  }

  private validateDateEcheance(date: string): string | boolean {
    const dateTime = new DateTime(date);
    if (dateTime.isBefore(this.datePiece)) return 'La date doit être supérieur ou égale à la date piece';
    else return true;
  }

  public typeCompte = '';
  private isEdit = false;

  public dialog = false;
  public searchCompteTiersDialog = false;

  private compteTiersNom = '';
  private libellePiece = '';
  private taux = '';
  private pieceAcquittee = false;
  private montantBase = '';
  private libelleMontantBase = '';
  private libelleSoldeCompteTiers = '';
  private delaiPaiementLibelle = '';
  private compteTiersEscomptePourcentage = '';
  private compteTiersEscompteNombreJours = '';
  private libelleCompteAssocie = '';
  private numeroCompteAchatVente = 0;
  private nomCompteAchatVente = '';
  private libelleCompteVenteAchat = '';
  private codeTaxe = 0;
  private hash = '';

  private resolve!: any;

  private forcerNumero = false;
  private numeroToForce = '';
  private numeroToForceRules: any = [
    (v: string) => !!v || 'Numéro obligatoire',
    (v: string) => !!v.toNumber() || 'Numéro invalide',
  ];

  private ventilleBase = 0;

  public open(
    periode: PeriodeComptable,
    journal: Journal,
    entete?: EntetePieceComptable
  ): Promise<{ action: DialogActionResult; data: EntetePieceComptable }> {
    this.dialog = true;
    if (entete) {
      this.piecereadonly = true;
      this.init(periode, journal, entete);
    } else {
      this.piecereadonly = false;
      this.init(periode, journal);

      const today = DateTime.today();
      if (today.isBefore(this.periode.dateDebut)) this.datePiece = this.periode.dateDebut;
      else if (today.isAfter(this.periode.dateFin)) this.datePiece = this.periode.dateFin;
      else this.datePiece = today;
    }

    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      if (entete) this.$nextTick(() => (this.refButtonModifier as any).$el.focus());
      else this.autocompleteCompteTier.focus();
    });
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  private init(periode: PeriodeComptable, journal: Journal, entete?: EntetePieceComptable) {
    this.journal = journal;
    this.periode = periode;
    this.periodeDisplay = periode.libellePeriodeFull;
    this.typeCompte = journal.typeCompteChar;
    if (entete) {
      this.numeroPiece = entete.codePiece ? entete.codePiece.toString() : '';
      this.getPiece();
    }
  }

  private resetForm() {
    this.autocompleteCompteTier.resetCompte();
    this.errorMessage = '';
    this.libelleWarningMessage = '';
    this.forcerNumero = false;
    this.numeroToForce = '';

    this.numeroCompteTierSelected = { numero: '', nom: '' };

    this.periodeDisplay = '';
    this.journal = new Journal();
    this.numeroPiece = '';
    this.numeroCompteTier = '';
    this.libelle = '';
    this.libelleFromInit = '';
    this.montantDevise = '';
    this.montantEscompte = '';
    this.deviseSelected = this.devises[0];
    this.statutSelected = this.statuts[0];
    this.datePiece = new DateTime();
    this.dateEcheance = null;
    this.typeCompte = '';

    this.compteTiersNom = '';
    this.libellePiece = '';
    this.taux = '';
    this.pieceAcquittee = false;
    this.montantBase = '';
    this.libelleMontantBase = '';
    this.libelleSoldeCompteTiers = '';
    this.delaiPaiementLibelle = '';
    this.compteTiersEscomptePourcentage = '';
    this.compteTiersEscompteNombreJours = '';
    this.libelleCompteAssocie = '';
    this.numeroCompteAchatVente = 0;
    this.nomCompteAchatVente = '';
    this.libelleCompteVenteAchat = '';
    this.codeTaxe = 0;
    this.contreparties = [];
    this.compteAssocieNumero = 0;
    this.compteAssocieNom = '';
    this.hash = '';
    (this.$refs.form as any).resetValidation();
    this.oldPiece = new PieceComptable();
  }

  private async getPiece() {
    this.errorMessage = '';
    this.pieceLoading = true;
    try {
      const pieceComptable = await AchatVenteApi.getPieceComptable(this.journal.numero, this.numeroPiece);
      this.setPiece(pieceComptable);
      this.autocompleteCompteTier.init(pieceComptable.compteTiersNumero.toString(), this.compteTiersNom);
    } catch (err) {
      this.errorMessage = displayAxiosError(err);
    } finally {
      this.pieceLoading = false;
    }
  }

  private setPiece(pieceComptable: PieceComptable) {
    this.oldPiece = new PieceComptable(pieceComptable);

    this.contreparties = pieceComptable.contreparties;

    this.numeroCompteTier = pieceComptable.compteTiersNumero.toString();
    this.libelle = pieceComptable.libelle;
    this.libelleFromInit = pieceComptable.libelle;

    if (pieceComptable) {
      const compteToSelect = {
        numero: pieceComptable.compteTiersNumero,
        nom: pieceComptable.compteTiersNom,
      };
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
    this.numeroCompteAchatVente = pieceComptable.compteVenteAchatNumero;
    this.libelleCompteVenteAchat = pieceComptable.libelleCompteVenteAchat;
    this.compteAssocieNom = pieceComptable.compteAssocieNom;
    this.compteAssocieNumero = pieceComptable.compteAssocieNumero;

    this.deviseSelected = pieceComptable
      ? this.getDeviseToSelect(
          new Devise({
            id: pieceComptable.codeDevise,
            libelle: pieceComptable.libelleDevise,
            typeDevise: 'D',
          })
        )
      : this.devises[0];
    this.statutSelected = pieceComptable
      ? this.getStatutToSelect(
          new Statut({
            id: pieceComptable.statut,
            libelle: pieceComptable.statutLibelle,
          })
        )
      : this.statuts[0];
    this.hash = pieceComptable.hash;
  }

  private compteLoading = false;
  private loadCompte() {
    if (this.piecereadonly) return;
    this.compteLoading = true;
    if (+this.numeroCompteTier) {
      CompteApi.getCompteDeTier(this.typeCompte, this.numeroCompteTier.toString())
        .then((compte) => {
          this.setCompteDeTier(compte);
        })
        .catch(() => {
          this.setCompteDeTier();
          this.$nextTick(() => this.autocompleteCompteTier?.focus());
        })
        .finally(() => {
          this.compteLoading = false;
        });
    }
  }

  private numeroCompteTierChange(value: string | CompteSearch | CompteDeTier) {
    if (value && typeof value === 'string') {
      this.numeroCompteTier = value;
      this.loadCompte();
    } else if (value instanceof CompteSearch) {
      this.numeroCompteTier = value.numero.toString();
      //this.$nextTick(() => this.autocompleteCompteTier?.blur());
      this.$nextTick(() => (this.$refs.libellePiece as any)?.focus());
      this.loadCompte();
    } else if (value instanceof CompteDeTier) {
      this.setCompteDeTier(value);
    } else {
      this.numeroCompteTier = '';
      this.compteTiersNom = '';
      this.setCompteDeTier(new CompteDeTier());
    }
  }

  private async setCompteDeTier(compte?: CompteDeTier) {
    this.numeroCompteTier = compte ? compte.numero.toString() : '';
    this.compteTiersNom = compte ? compte.nom : '';
    this.deviseSelected = compte
      ? this.getDeviseToSelect(
          new Devise({
            id: compte.codeDevise,
            libelle: compte.libelleDevise,
            typeDevise: 'D',
          })
        )
      : this.devises[0];
    this.libelleSoldeCompteTiers = compte ? compte.libelleSoldeCompteTiers : '';
    this.compteTiersEscomptePourcentage = compte ? compte.escomptePourcentage.toDecimalString(2) : '';
    this.compteTiersEscompteNombreJours = compte ? compte.escompteNombreJours.toDecimalString(2) : '';
    this.libelleCompteAssocie = compte ? compte.libelleCompteAssocie : '';
    this.numeroCompteAchatVente = compte ? compte.compteVenteAchatNumero : 0;
    this.libelleCompteVenteAchat = compte ? compte.libelleCompteVenteAchat : '';
    this.delaiPaiementLibelle = compte ? compte.delaiPaiementLibelle : '';
    this.codeTaxe = compte ? compte.codeTaxe : 0;
    this.compteAssocieNumero = compte ? compte.compteAssocieNumero : 0;
    this.compteAssocieNom = compte ? compte.compteAssocieNom : '';
    this.initDateEcheance(this.numeroCompteTier, this.typeCompte, this.datePiece, false);
  }

  private validateLibelle() {
    if (!this.piecereadonly && this.libelle && this.libelle != this.libelleFromInit) {
      AchatVenteApi.validateLibelle(this.libelle, this.typeCompte, this.numeroCompteTier).then((numeroPiece) => {
        if (numeroPiece != 0) {
          this.libelleWarningMessage = `Attention, ce libellé est déjà utilisé par la pièce ${this.journal.numero}.${numeroPiece}`;
          (this.$refs.confirmLibellelDialog as Confirm)
            .open(
              'Attention',
              `Attention, ce libellé est déjà utilisé par la pièce ${this.journal.numero}.${numeroPiece}`,
              'error',
              'OK'
            )
            .then(() => {
              this.$nextTick(() => (this.$refs.montant as any)?.focus());
            });
        } else this.libelleWarningMessage = '';
      });
    } else this.libelleWarningMessage = '';
  }

  private ModifierPiece() {
    this.piecereadonly = false;
    this.autocompleteCompteTier.focus();
    //await this.loadCompte();
  }

  private devisesLoading = false;
  private async loadDevises() {
    try {
      if (this.devises.length <= 1) {
        this.devisesLoading = true;
        this.devises = await DeviseApi.getAllDevises();
      }
    } finally {
      this.devisesLoading = false;
    }
  }
  private getDeviseToSelect(deviseSelected: Devise): Devise {
    const deviseToSelect = this.devises.find((d) => d.id == deviseSelected.id);
    if (!deviseToSelect) {
      this.devises.push(deviseSelected);
      return deviseSelected;
    } else return deviseToSelect;
  }

  private statutsLoading = false;
  private async loadStatuts() {
    try {
      if (this.statuts.length <= 1) {
        this.statutsLoading = true;
        this.statuts = await AchatVenteApi.getAllStatut();
        this.statutSelected = this.statuts[0];
      }
    } finally {
      this.statutsLoading = false;
    }
  }
  private getStatutToSelect(statutSelected: Statut): Statut {
    const statutToSelect = this.statuts.find((d) => d.id == statutSelected.id);
    if (!statutToSelect) {
      this.statuts.push(statutSelected);
      return statutSelected;
    } else return statutSelected;
  }

  @Watch('datePiece')
  private async datePieceChanged(val: DateTime) {
    if (!this.piecereadonly) {
      await this.initDateEcheance(this.numeroCompteTier, this.typeCompte, val, true);
      if (this.deviseSelected) this.initTauxDevise(this.deviseSelected.id, val);
    }
  }

  private async initDateEcheance(
    numeroCompteTier: string,
    typeComptetier: string,
    datePiece: DateTime,
    focusDateEcheance: boolean
  ) {
    if (this.numeroCompteTier && this.typeCompte && datePiece.isValid()) {
      await AchatVenteApi.getDateEcheance(typeComptetier, numeroCompteTier, datePiece)
        .then((dateEcheance) => {
          this.dateEcheance = dateEcheance;
          if (focusDateEcheance) {
            this.refDateEcheance.selectText();
          }
        })
        .catch((err) => {
          this.errorMessage = displayAxiosError(err);
        });
    }
  }

  private initTauxDevise(numeroDevise: number, datePiece: DateTime) {
    if (!numeroDevise || numeroDevise == 1) this.taux = '1,000000';
    else if (this.datePiece.isValid() && numeroDevise) {
      //this.taux = "0,890000";
      DeviseApi.getTaux(numeroDevise, datePiece)
        .then((resp) => {
          this.taux = resp.toDecimalString(6);
        })
        .catch((err) => {
          this.errorMessage = displayAxiosError(err);
        });
    }
    this.recalculmontantBase();
  }

  @Watch('montantDevise')
  private montantDeviseChanged() {
    if (!this.piecereadonly) this.recalculmontantBase();
  }

  @Watch('deviseSelected')
  private deviseSelectedChanged(val: Devise) {
    if (!this.piecereadonly && val && this.datePiece.isValid()) {
      this.initTauxDevise(this.deviseSelected.id, this.datePiece);
    }
  }

  private recalculmontantBase() {
    if (this.piecereadonly) return;

    if (this.taux.isDecimal(true) && this.montantDevise.isDecimal(true)) {
      this.montantBase = (this.montantDevise.toNumber() * this.taux.toNumber()).toDecimalString(2);
      this.libelleMontantBase = `${this.montantBase} EUR`;
    } else {
      this.montantBase = '';
      this.libelleMontantBase = '';
    }
  }

  private createContrepartie() {
    if (this.compteTiersNom) this.gridContreparties.createContrepartie();
  }

  private saveLoading = false;
  private async savePiece() {
    (this.$refs.form as any).validate();
    this.$nextTick(async () => {
      if (this.isValid && (await this.confirmEquilibre())) {
        const pieceToSave = this.getModelToSave();
        if (pieceToSave.numeroPiece == 0) this.addPiece(pieceToSave);
        else this.updatePiece();
      }
    });
  }

  private async confirmEquilibre(): Promise<boolean> {
    try {
      if (!this.gridContreparties.pieceIsEquilibre())
        return await (this.$refs.confirmDialog as Confirm).open(
          'Attention, pièce non équilibrée',
          `La pièce n'est pas équilibrée, voulez-vous sauvegarder ?`,
          'error',
          'Sauvegarder'
        );
      else if (this.gridContreparties.errorInTVA())
        return await (this.$refs.confirmDialog as Confirm).open(
          'Attention, contrôle de tva',
          `La tva calculée est différente de la tva imputée, voulez-vous sauvegarder ?`,
          'error',
          'Sauvegarder'
        );
      return true;
    } catch (err) {
      return false;
    }
  }

  private addPiece(piece: PieceComptableSaveDTO) {
    this.saveLoading = true;
    this.piecereadonly = true;
    this.errorMessage = '';
    AchatVenteApi.addPiece(piece)
      .then((numeroPiece) => {
        this.numeroPiece = numeroPiece.toString();
        this.resolve({
          action: DialogActionResult.Create,
          data: this.getModelForGrid(),
        });
        (this.$refs.form as any).resetValidation();
        this.dialog = false;
        this.resetForm();
      })
      .catch((err) => {
        this.errorMessage = displayAxiosError(err);
        this.piecereadonly = false;
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private updatePiece() {
    this.saveLoading = true;
    this.errorMessage = '';
    const pieceComptaToSave = this.getModelToSave();
    this.piecereadonly = true;
    AchatVenteApi.updatePiece(pieceComptaToSave)
      .then(() => {
        this.resolve({
          action: DialogActionResult.Update,
          data: this.getModelForGrid(),
        });
        this.dialog = false;
        this.resetForm();
      })
      .catch((err) => {
        this.errorMessage = displayAxiosError(err);
        this.piecereadonly = false;
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private deleteIsLoading = false;
  private deletePiece() {
    this.autocompleteCompteTier?.blur();
    this.$nextTick(() => this.openConfirmDelete());
  }
  private openConfirmDelete() {
    this.confirmDialog
      .open(
        'Suppression',
        `Êtes-vous sûr de vouloir supprimer la pièce ${this.journal.numero}.${this.numeroPiece} ?`,
        'error',
        'Supprimer'
      )
      .then((resp) => {
        if (resp) {
          this.deleteIsLoading = true;
          AchatVenteApi.deletePiece(this.periode.typePeriodeComptable, this.journal.numero, +this.numeroPiece)
            .then(() => {
              this.dialog = false;
              this.resolve({
                action: DialogActionResult.Delete,
                data: this.getModelForGrid(),
              });
              this.resetForm();
            })
            .catch((err) => {
              this.errorMessage = displayAxiosError(err);
            })
            .finally(() => {
              this.deleteIsLoading = false;
            });
        } else {
          this.$nextTick(() => this.autocompleteCompteTier?.focus());
        }
      })
      .catch(() => {
        this.$nextTick(() => this.autocompleteCompteTier?.focus());
      });
  }

  private getModelToSave(): PieceComptableSaveDTO {
    const pieceComptaSave: PieceComptableSaveDTO = new PieceComptableSaveDTO();
    if (this.forcerNumero && this.numeroToForce) pieceComptaSave.numeroPiece = +this.numeroPiece;

    pieceComptaSave.periode = this.periode.typePeriodeComptable;
    pieceComptaSave.numeroJournal = this.journal.numero;
    pieceComptaSave.numeroPiece = this.numeroPiece.toNumber();
    pieceComptaSave.datePiece = this.datePiece.toUtc();
    pieceComptaSave.dateEcheance = this.dateEcheance?.toUtc() || '';
    pieceComptaSave.montantBase = this.montantBase.toNumber();
    pieceComptaSave.montantDevise = this.montantDevise.toNumber();
    pieceComptaSave.codeDevise = this.deviseSelected.id;
    pieceComptaSave.libelle = this.libelle;
    pieceComptaSave.typeCompte = this.typeCompte;
    pieceComptaSave.numeroCompte = this.numeroCompteTier.toNumber();
    pieceComptaSave.numeroCompteAssocie = this.compteAssocieNumero;
    pieceComptaSave.montantEscompteBase = this.montantEscompte.toNumber() * this.taux.toNumber();
    pieceComptaSave.montantEscompteDevise = this.montantEscompte.toNumber();
    pieceComptaSave.codeBlocage = this.statutSelected.id;
    pieceComptaSave.pieceAcquittee = this.pieceAcquittee;
    pieceComptaSave.codeMouvement = this.journal.codeMouvement;
    pieceComptaSave.contreparties = [];

    let i = 1;
    this.contreparties.forEach((c) => {
      const contr: PieceComptableContrepartieSaveDTO = new PieceComptableContrepartieSaveDTO();
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

  private getModelForGrid(): EntetePieceComptable {
    const entete = new EntetePieceComptable();
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

  private cancelEdit() {
    if (this.numeroPiece.toNumber() == 0) {
      this.$nextTick(() => {
        this.confirmDialog
          .open('Annuler', `Êtes-vous sûr de vouloir annuler  ?`, 'warning', 'Annuler la création')
          .then((resp) => {
            if (resp) {
              this.closeDialog();
            } else {
              this.$nextTick(() => this.autocompleteCompteTier?.focus());
            }
          })
          .catch(() => {
            this.$nextTick(() => this.autocompleteCompteTier?.focus());
          });
      });
    } else {
      this.setPiece(this.oldPiece);
      this.piecereadonly = true;
    }
  }

  private closeDialog() {
    if (!this.piecereadonly) {
      this.confirmDialog
        .open('Fermer', `Êtes-vous sûr de vouloir fermer ? Ceci annulera vos modifications.`, 'warning', 'Fermer')
        .then((resp) => {
          if (resp) {
            this.resetForm();
            this.autocompleteCompteTier?.blur();
            this.$nextTick(() => {
              this.dialog = false;
              this.resolve({ action: DialogActionResult.None });
            });
          }
        });
    } else {
      this.resetForm();
      this.autocompleteCompteTier?.blur();
      this.$nextTick(() => {
        this.dialog = false;
        this.resolve({ action: DialogActionResult.None });
      });
    }
  }

  private clickOutside() {
    if (this.piecereadonly) this.closeDialog();
  }
}
</script>

<style>
.textMini {
  font-size: 12px;
}

.warningMessage {
  color: #fb8c00;
  font-weight: 500;
}
</style>
