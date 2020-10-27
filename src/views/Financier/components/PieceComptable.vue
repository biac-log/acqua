<template>
  <v-dialog
    v-model="dialog"
    scrollable
    eager
    width="80%"
    :persistent="!readonly || saveLoading || deleteLoading"
    @click:outside.stop="clickOutside"
    @keydown.f2.stop="modifierPiece()"
    @keydown.46.prevent.stop="deletePiece"
    @keydown.107.prevent.stop="createExtrait"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="savePiece()"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <p class="mb-0" v-if="!newRecord">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
            <p class="mb-0" v-else>Nouvelle pièce</p>
            <p class="ml-10 mb-0 textMini">Période {{ periode.libellePeriodeFull.toLowerCase() }}</p>
            <p class="ml-5 mb-0 textMini">Journal {{ journal.fullLibelle }}</p>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-tooltip v-if="readonly" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-5" color="success" :disabled="isLoading" @click="modifierPiece" v-on="on">
                <v-icon left>mdi-pencil</v-icon>Modifier
              </v-btn>
            </template>
            <span>
              Modifier la pièce
              <span class="shortcutTooltip">F2</span>
            </span>
          </v-tooltip>
          <v-tooltip v-if="readonly" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                class="mr-10"
                color="error"
                :disabled="saveLoading"
                @click="deletePiece"
                :loading="deleteLoading"
              >
                <v-icon left>mdi-delete</v-icon>Supprimer
              </v-btn>
            </template>
            <span>
              Supprimer la pièce
              <span class="shortcutTooltip">del</span>
            </span>
          </v-tooltip>
          <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pb-0 pt-0">
          <v-col cols="12" class="pr-5">
            <v-row fill-height no-gutters>
              <AlertMessageVue ref="warningMessage" type="warning"></AlertMessageVue>
              <v-col cols="12" x-lg="5" lg="12">
                <v-row dense>
                  <v-col cols="4">
                    <v-text-field
                      v-model="libelleCompte"
                      label="Compte"
                      :filled="readonly"
                      readonly
                      tabindex="-1"
                    ></v-text-field>
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
                    <v-text-field label="Solde actuel" v-model="soldeActuel" :filled="readonly" readonly></v-text-field>
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
                  :IsLoading.sync="pieceIsLoading"
                  @CreateExtrait="createExtrait"
                  @EditExtrait="editExtrait"
                ></ExtraitsVue>
              </v-col>
            </v-row>
          </v-col>
          <v-row dense>
            <ExtraitVue ref="refExtraitVue" :isReadOnly.sync="readonly" :DatePiece.sync="datePiece"></ExtraitVue>
          </v-row>
        </v-card-text>
        <v-divider v-if="saveLoading || deleteLoading || !readonly"></v-divider>
        <v-card-actions v-if="saveLoading || deleteLoading || !readonly" class="d-flex">
          <v-tooltip v-if="numeroPiece" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                color="error"
                v-on="on"
                class="ma-2 pr-4 align-self-start"
                text
                tabindex="-1"
                @click="deletePiece()"
                :disabled="saveLoading"
                :loading="deleteLoading"
                >Supprimer</v-btn
              >
            </template>
            <span>
              Supprimer la pièce
              <span class="shortcutTooltip">del</span>
            </span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-btn
            color="warning"
            class="ma-2 mt-0 pr-4 align-self-start"
            text
            tabindex="-1"
            v-if="!numeroPiece && !forcerNumero"
            @click="forcerNumero = true"
            >Forcer le numéro de pièce</v-btn
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
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                color="blue darken-1"
                v-on="on"
                class="ma-2 mt-0 pr-4 align-self-start"
                tile
                outlined
                @click="cancelEdit()"
                tabindex="-1"
                :disabled="deleteLoading"
              >
                <v-icon left>mdi-close</v-icon>Annuler
              </v-btn>
            </template>
            <span>
              Annuler les modifications
              <span class="shortcutTooltip">esc</span>
            </span>
          </v-tooltip>

          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                ref="btnValidate"
                v-on="on"
                class="ma-2 mt-0 pr-4 align-self-start"
                tile
                color="success"
                :loading="saveLoading"
                :disabled="!isValid || deleteLoading"
                @click="savePiece()"
              >
                <v-icon left>mdi-content-save</v-icon>Sauvegarder
              </v-btn>
            </template>
            <span>
              Sauvegarder la pièce
              <span class="shortcutTooltip">alt + enter</span>
            </span>
          </v-tooltip>
        </v-card-actions>
        <Confirm ref="confirmDialog"></Confirm>
      </v-card>
    </v-form>
    <v-dialog
      v-model="datePieceDialog"
      width="300"
      eager
      style="z-index: 999999999999999999"
      @keydown.enter.stop="datePieceDialog = false"
    >
      <v-card>
        <v-card-title primary-title>Nouvelle pièce</v-card-title>
        <v-card-text>
          <DatePicker
            ref="refDatePieceDialog"
            name="datePiece"
            label="Date pièce"
            :date.sync="datePiece"
            :readonly.sync="readonly"
            :filled="readonly"
            :rules.sync="datePieceRules"
            autofocus
          ></DatePicker>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="datePieceDialog = false">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { PeriodeComptable, EntetePieceComptable, Journal, Piece, Extrait } from '@/models/Financier';
import { DateTime } from '@/models/DateTime';
import AlertMessageVue from '@/components/AlertMessage.vue';
import DatePicker from '@/components/DatePicker.vue';
import ExtraitsVue from './Extraits.vue';
import { FinancierApi } from '../../../api/FinancierApi';
import ExtraitVue from './Extrait.vue';
import Confirm from '@/components/Confirm.vue';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { PieceSaveDTO, ExtraitSaveDTO, VentilationSaveDTO } from '../../../models/Financier/Save/PieceSave';
import { sum } from 'lodash';

@Component({
  components: { ExtraitsVue, DatePicker, ExtraitVue, Confirm, AlertMessageVue }
})
export default class PieceComptableVue extends Vue {
  @Ref() refExtraitVue!: ExtraitVue;
  @Ref() gridExtraits!: ExtraitsVue;
  @Ref() confirmDialog!: Confirm;
  @Ref() refDatePiece!: DatePicker;
  @Ref() refDatePieceDialog!: DatePicker;
  @Ref() warningMessage!: AlertMessageVue;

  private dialog = false;
  private oldPiece!: Piece | null;
  private readonly = false;
  private resolve: any;
  private reject: any;
  private isValid = true;

  private periode = new PeriodeComptable();
  private journal = new Journal();
  private numeroPiece = '';
  private libelleCompte = '';

  private datePieceDialog = false;
  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [
    (v: string) => !!v || 'Date obligatoire',
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDatePiece(v) || 'La date est hors période'
  ];

  private extraits: Extrait[] = [];
  private soldeInitial = '';
  private soldeActuel = '';

  private forcerNumero = false;
  private numeroToForce = '';
  private numeroToForceRules: any = [
    (v: string) => !!v || 'Numéro obligatoire',
    (v: string) => !!v.toNumber() || 'Numéro invalide'
  ];

  private saveLoading = false;
  private deleteLoading = false;
  private pieceIsLoading = false;
  get isLoading() {
    return this.saveLoading || this.deleteLoading || this.pieceIsLoading;
  }
  private newRecord = false;

  private validateDatePiece(date: string): boolean {
    const dateTime = new DateTime(date);
    return dateTime.isBetween(this.periode.dateDebut, this.periode.dateFin);
  }

  private hash = '';
  public async openNew(periode: PeriodeComptable, journal: Journal): Promise<string> {
    this.dialog = true;
    this.$nextTick(() => {
      this.newRecord = true;
      this.datePieceDialog = true;
    });
    this.reset();
    this.periode = periode;
    this.journal = journal;
    this.libelleCompte = `${journal.compteBanque.numero.toString()} ${journal.compteBanque.nom}`;
    const solde = await FinancierApi.getSoldeCompte(journal.numeroCompteBanque);
    this.soldeInitial = solde.toComptaString();

    const today = DateTime.today();
    if (today.isBefore(this.periode.dateDebut)) this.datePiece = this.periode.dateDebut;
    else if (today.isAfter(this.periode.dateFin)) this.datePiece = this.periode.dateFin;
    else this.datePiece = today;

    this.focusDatePiece();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public open(periode: PeriodeComptable, journal: Journal, numeroPieteToLoad: number): Promise<EntetePieceComptable> {
    this.newRecord = false;
    this.dialog = true;
    this.readonly = true;
    this.periode = periode;
    this.journal = journal;
    this.libelleCompte = `${journal.compteBanque.numero.toString()} ${journal.compteBanque.nom}`;
    this.pieceIsLoading = true;
    FinancierApi.getPieceComptable(journal.numero, numeroPieteToLoad)
      .then((piece) => {
        this.init(piece);
      })
      .catch((err) => {
        this.warningMessage.show('Une erreur est survenue lors du chargement de la pièce.', err.toString());
      })
      .finally(() => {
        this.pieceIsLoading = false;
      });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private createExtrait() {
    if (!this.readonly) {
      this.refExtraitVue
        .openNew(this.journal)
        .then((resp: Extrait) => {
          const maxLigne = this.extraits?.length ? Math.max(...this.extraits.map((i) => i.numeroExtrait)) : 0;
          resp.numeroExtrait = maxLigne + 1;
          this.extraits.push(resp);
        })
        .catch()
        .finally(() => {
          this.gridExtraits?.focus();
        });
    }
  }

  private editExtrait(extrait: Extrait) {
    this.refExtraitVue
      .open(this.journal, this.numeroPiece, extrait)
      .then((resp: Extrait) => {
        if (resp)
          Vue.set(
            this.extraits,
            this.extraits.findIndex((d) => d == extrait),
            resp
          );
        else this.extraits.splice(this.extraits.indexOf(extrait), 1);
      })
      .catch()
      .finally(() => {
        this.calculSolde();
        this.gridExtraits?.focus();
      });
  }

  private init(piece: Piece) {
    this.oldPiece = piece;
    this.numeroPiece = piece.numeroPiece.toString();
    this.libelleCompte = `${piece.numeroCompteFinancier.toString()} ${piece.nomCompteFinancier}`;
    this.datePiece = new DateTime(piece.datePiece);
    this.soldeInitial = piece.soldeInitial.toComptaString(2);
    this.extraits = piece.extraits;

    this.hash = piece.hash;
  }

  private reset() {
    this.warningMessage.clear();
    this.periode = new PeriodeComptable();
    this.journal = new Journal();
    this.libelleCompte = '';
    this.datePiece = new DateTime();
    this.extraits = [];
    this.oldPiece = null;
    this.readonly = false;
    this.numeroPiece = '0';
    this.hash = '';
    this.soldeInitial = '';
    this.soldeActuel = '';
    this.newRecord = false;
    (this.$refs.extraits as any)?.reset();
  }

  @Watch('extraits')
  private calculSolde() {
    const sumCredit = sum(this.extraits.map((m) => m.montantCredit.toNumber()));
    const sumDebit = sum(this.extraits.map((m) => m.montantDebit.toNumber()));
    this.soldeActuel = (this.soldeInitial.toNumber() + sumDebit - sumCredit).toComptaString();
  }

  private deletePiece() {
    this.confirmDialog
      .open(
        'Suppression',
        `Êtes-vous sur de vouloir supprimer la piece ${this.journal.numero}.${this.numeroPiece} ?`,
        'error',
        'Supprimer'
      )
      .then((resp) => {
        if (resp) {
          this.deleteLoading = true;
          this.readonly = true;
          FinancierApi.deletePieceComptable(
            this.periode.typePeriodeComptable,
            this.journal.numero,
            this.numeroPiece.toNumber()
          )
            .then(() => {
              this.dialog = false;
              this.resolve();
            })
            .catch((err) => {
              this.readonly = false;
              this.warningMessage.show('Une erreur est survenue lors de la suppression', displayAxiosError(err));
            })
            .finally(() => {
              this.deleteLoading = false;
            });
        }
      });
  }

  private async savePiece() {
    (this.$refs.form as any).validate();
    this.$nextTick(async () => {
      if (this.isValid) {
        const pieceToSave = this.getModelToSave();
        if (pieceToSave.numeroPiece == 0) this.addPiece(pieceToSave);
        else this.updatePiece(pieceToSave);
      }
    });
  }

  private addPiece(piece: PieceSaveDTO) {
    this.saveLoading = true;
    this.readonly = true;
    FinancierApi.addPieceComptable(piece)
      .then((numeroPiece) => {
        this.numeroPiece = numeroPiece.toString();
        this.resolve(numeroPiece);
        (this.$refs.form as any).resetValidation();
        this.dialog = false;
        this.reset();
      })
      .catch((err) => {
        this.warningMessage.show('Une erreur est survenue lors de la sauvegarde de la pièce', displayAxiosError(err));
        this.readonly = false;
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private updatePiece(piece: PieceSaveDTO) {
    this.saveLoading = true;
    this.readonly = true;
    FinancierApi.updatePieceComptable(piece)
      .then(() => {
        this.resolve(piece.numeroPiece);
        this.dialog = false;
        this.reset();
      })
      .catch((err) => {
        this.warningMessage.show('Une erreur est survenue lors de la mise à jour de la pièce', displayAxiosError(err));
        this.readonly = false;
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private getModelToSave(): PieceSaveDTO {
    const pieceToSave: PieceSaveDTO = new PieceSaveDTO();
    if (this.forcerNumero && this.numeroToForce) pieceToSave.numeroPiece = +this.numeroPiece;

    pieceToSave.periode = this.periode.typePeriodeComptable;
    pieceToSave.numeroJournal = this.journal.numero;
    pieceToSave.numeroPiece = this.numeroPiece.toNumber();
    pieceToSave.datePiece = this.datePiece.toUtc();
    pieceToSave.soldeInitial = this.soldeInitial.toNumber();
    pieceToSave.hash = this.hash;
    pieceToSave.extraits = [];

    this.extraits.forEach((e) => {
      const extrait: ExtraitSaveDTO = new ExtraitSaveDTO();
      extrait.numeroExtrait = e.numeroExtrait;
      extrait.montantBase = e.montantBase;
      extrait.montantDevise = e.montantDevise;
      extrait.libelle = e.libelleReglement;
      extrait.codeMouvement = e.codeMouvement;
      extrait.codeReglement = e.codeReglement;
      pieceToSave.extraits.push(extrait);

      e.ventilations.forEach((v) => {
        const ventilation: VentilationSaveDTO = new VentilationSaveDTO();
        ventilation.numeroVentilation = v.numeroVentilation;
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

  // private getModelForGrid(): EntetePieceComptable {
  //   const entetePieceComptable = new EntetePieceComptable();
  //   entetePieceComptable.numeroJournal = this.journal.numero;
  //   entetePieceComptable.numeroPiece = this.numeroPiece.toNumber();
  //   entetePieceComptable.soldeInitiale = this.soldeInitial.toNumber();
  //   entetePieceComptable.totalDebit = _.sum(this.extraits.map((m) => m.montantDebit.toNumber()));
  //   entetePieceComptable.totalCredit = _.sum(this.extraits.map((m) => m.montantCredit.toNumber()));
  //   entetePieceComptable.soldeFinale = this.soldeActuel.toNumber();
  //   entetePieceComptable.pieceEquilibree = true;
  //   entetePieceComptable.libelleDevise = this.journal.devise.libelle;
  //   entetePieceComptable.datePiece = this.datePiece.toString();
  //   entetePieceComptable.libelle = this.journal.libelle;
  //   return entetePieceComptable;
  // }

  private modifierPiece() {
    if (!this.pieceIsLoading) {
      this.readonly = false;
      this.focusDatePiece();
    }
  }

  @Watch('datePieceDialog')
  private focusDatePiece() {
    if (this.datePieceDialog) this.$nextTick(() => this.refDatePieceDialog.focus());
    else this.refDatePiece.focus();
  }

  private cancelEdit() {
    if (this.deleteLoading || this.saveLoading) return;
    this.readonly = true;
    if (this.numeroPiece.toNumber() == 0) this.closeDialog();
    else if (this.oldPiece) {
      this.init(this.oldPiece);
    }
  }

  private closeDialog() {
    this.reset();
    this.dialog = false;
    this.reject();
  }

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }
}
</script>

<style scopped>
.textMini {
  font-size: 12px;
}

.warningMessage {
  color: #fb8c00;
  font-weight: 500;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}
</style>
