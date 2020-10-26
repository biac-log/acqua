<template>
  <v-dialog
    v-model="dialog"
    scrollable
    eager
    width="80%"
    :persistent="!readonly || saveLoading || deleteLoading"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierPiece()"
    @keydown.46.prevent.stop="deletePiece"
    @keydown.107.prevent.stop="createImputation()"
    @keydown.esc.prevent="cancelEdit()"
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
          <v-row>
            <v-col cols="6" class="pr-5">
              <v-row fill-height no-gutters>
                <AlertMessageVue ref="warningMessage" type="warning"></AlertMessageVue>
                <v-row dense>
                  <v-col cols="3">
                    <DatePicker
                      ref="refDatePiece"
                      name="datePiece"
                      label="Date pièce"
                      :date.sync="datePiece"
                      :readonly.sync="readonly"
                      :filled="readonly"
                      :rules.sync="datePieceRules"
                      :hide-details="readonly"
                    ></DatePicker>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Débit"
                      :value="debit | numberToString"
                      :filled="readonly"
                      :hide-details="readonly"
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Crédit"
                      :value="credit | numberToString"
                      :filled="readonly"
                      :hide-details="readonly"
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="A ventilé"
                      :value="solde | numberToStringEvenZero"
                      :filled="readonly"
                      :hide-details="readonly"
                      readonly
                      tabindex="-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-card class="pb-0" outlined>
                      <v-toolbar color="#EEEEEE" flat dense>
                        <v-card-title>
                          Imputations
                          <v-tooltip top open-delay="500">
                            <template v-slot:activator="{ on }">
                              <v-btn
                                color="primary"
                                fab
                                x-small
                                class="ml-5"
                                ref="btnAdd"
                                :disabled="readonly"
                                @click.stop="createImputation()"
                                v-on="on"
                              >
                                <v-icon>mdi-plus</v-icon>
                              </v-btn>
                            </template>
                            <span>Ajouter une ligne <span class="shortcutTooltip"> + </span></span>
                          </v-tooltip>
                        </v-card-title>
                        <v-spacer></v-spacer>
                      </v-toolbar>
                      <v-data-table
                        id="dataTable"
                        :headers="headersImputations"
                        :items="imputations"
                        @click:row="openImputation"
                        dense
                        disable-pagination
                        hide-default-footer
                        height="352"
                      >
                        <template v-slot:[`item.debit`]="{ item }">
                          <span>{{ item.debit | numberToString }}</span>
                        </template>
                        <template v-slot:[`item.credit`]="{ item }">
                          <span>{{ item.credit | numberToString }}</span>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-col>
                </v-row>
              </v-row>
            </v-col>
            <v-col cols="6">
              <ImputationVue
                ref="refImputationVue"
                :DatePiece.sync="datePiece"
                :isReadonly.sync="readonly"
                :periode.sync="periode"
                :journal="journal"
              ></ImputationVue>
            </v-col>
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
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import { PeriodeComptable, EntetePieceComptable, Journal, PieceComptable, Imputation } from '@/models/OperationDiverse';
import { DateTime } from '@/models/DateTime';
import AlertMessageVue from '@/components/AlertMessage.vue';
import DatePicker from '@/components/DatePicker.vue';
import ImputationVue from './Imputation.vue';
import OperationDiverseApi from '../../../api/OperationDiverseApi';
import _ from 'lodash';
import Confirm from '@/components/Confirm.vue';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { PieceSaveDTO, ExtraitSaveDTO, VentilationSaveDTO } from '../../../models/Financier/Save/PieceSave';

@Component({
  components: { ImputationVue, DatePicker, Confirm, AlertMessageVue }
})
export default class OperationDiverseVue extends Vue {
  @Ref() refImputationVue!: ImputationVue;
  @Ref() confirmDialog!: Confirm;
  @Ref() refDatePiece!: DatePicker;
  @Ref() refDatePieceDialog!: DatePicker;
  @Ref() warningMessage!: AlertMessageVue;
  @Ref() btnAddImputation!: any;

  private dialog = false;
  private oldPiece!: PieceComptable | null;
  private readonly = false;
  private resolve: any;
  private reject: any;
  private isValid = true;

  private periode = new PeriodeComptable();
  private journal = new Journal();
  private numeroPiece = '';

  private datePieceDialog = false;
  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [
    (v: string) => !!v || 'Date obligatoire',
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDatePiece(v) || 'La date est hors période'
  ];

  get credit() {
    return _.sum(this.imputations.filter((c) => c.codeMouvement == 'CR').map((i) => i.montantDevise));
  }
  get debit() {
    return _.sum(this.imputations.filter((c) => c.codeMouvement == 'DB').map((i) => i.montantDevise));
  }
  get solde() {
    return Math.abs(this.credit - this.debit);
  }
  private imputations: Imputation[] = [];
  private headersImputations = [
    { text: 'Compte', value: 'libelleCompte' },
    { text: 'Libelle écriture', value: 'libelle' },
    { text: 'Débit', value: 'debit' },
    { text: 'Crédit', value: 'credit' },
    { text: 'Case TVA', value: 'libelleCaseTVA', align: 'end' }
  ];

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

  private validateDatePiece(date: string): boolean {
    const dateTime = new DateTime(date);
    return dateTime.isBetween(this.periode.dateDebut, this.periode.dateFin);
  }

  private hash = '';
  public async openNew(periode: PeriodeComptable, journal: Journal): Promise<string> {
    this.dialog = true;
    this.readonly = false;
    this.reset();
    this.periode = periode;
    this.journal = journal;
    this.numeroPiece = (journal.numeroDernierePiece + 1).toString();

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

  public open(periode: PeriodeComptable, journal: Journal, numeroPieceToLoad: number): Promise<EntetePieceComptable> {
    this.dialog = true;
    this.readonly = true;
    this.periode = periode;
    this.journal = journal;
    this.pieceIsLoading = true;
    OperationDiverseApi.getPieceComptable(periode.typePeriodeComptable, journal.numero, numeroPieceToLoad)
      .then((piece) => {
        this.init(piece);
      })
      .catch((err) => {
        this.warningMessage.show('Une erreur est survenue lors du chargement de la pièce.', err.toString());
      })
      .finally(() => {
        this.pieceIsLoading = false;
        this.focusDatePiece();
      });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private createImputation() {
    if (!this.readonly) {
      this.refImputationVue
        .openNew()
        .then((resp: Imputation) => {
          const maxLigne = this.imputations?.length ? Math.max(...this.imputations.map((i) => i.numeroVentilation)) : 0;
          resp.numeroVentilation = maxLigne + 1;
          this.imputations.push(resp);
        })
        .catch()
        .finally(() => {
          this.$nextTick(() => this.btnAddImputation?.$el?.focus());
        });
    }
  }

  private openImputation(imputation: Imputation) {
    this.refImputationVue
      .open(imputation)
      .then((resp: Imputation) => {
        if (resp)
          Vue.set(
            this.imputations,
            this.imputations.findIndex((d) => d == imputation),
            resp
          );
        else this.imputations.splice(this.imputations.indexOf(imputation), 1);
      })
      .catch()
      .finally(() => {
        this.calculSolde();
        //this.grid?.focus();
      });
  }

  private init(piece: PieceComptable) {
    this.oldPiece = piece;
    this.numeroPiece = piece.numeroPiece.toString();
    this.datePiece = new DateTime(piece.datePiece);
    this.imputations = piece.imputations;
    this.hash = piece.hash;
  }

  private reset() {
    this.warningMessage.clear();
    this.periode = new PeriodeComptable();
    this.journal = new Journal();
    this.datePiece = new DateTime();
    this.imputations = [];
    this.oldPiece = null;
    this.readonly = false;
    this.numeroPiece = '';
    this.hash = '';
    // this.soldeInitial = '';
    // this.soldeActuel = '';
    (this.$refs.extraits as any)?.reset();
  }

  @Watch('extraits')
  private calculSolde() {
    // const sumCredit = _.sum(this.extraits.map((m) => m.montantCredit.toNumber()));
    // const sumDebit = _.sum(this.extraits.map((m) => m.montantDebit.toNumber()));
    // this.soldeActuel = (this.soldeInitial.toNumber() + sumDebit - sumCredit).toComptaString();
  }

  private deletePiece() {
    // this.confirmDialog
    //   .open(
    //     'Suppression',
    //     `Êtes-vous sur de vouloir supprimer la piece ${this.journal.numero}.${this.numeroPiece} ?`,
    //     'error',
    //     'Supprimer'
    //   )
    //   .then((resp) => {
    //     if (resp) {
    //       this.deleteLoading = true;
    //       this.readonly = true;
    //       FinancierApi.deletePieceComptable(
    //         this.periode.typePeriodeComptable,
    //         this.journal.numero,
    //         this.numeroPiece.toNumber()
    //       )
    //         .then(() => {
    //           this.dialog = false;
    //           this.resolve();
    //         })
    //         .catch((err) => {
    //           this.readonly = false;
    //           this.warningMessage.show('Une erreur est survenue lors de la suppression', displayAxiosError(err));
    //         })
    //         .finally(() => {
    //           this.deleteLoading = false;
    //         });
    //     }
    //   });
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
    // FinancierApi.addPieceComptable(piece)
    //   .then((numeroPiece) => {
    //     this.numeroPiece = numeroPiece.toString();
    //     this.resolve(numeroPiece);
    //     (this.$refs.form as any).resetValidation();
    //     this.dialog = false;
    //     this.reset();
    //   })
    //   .catch((err) => {
    //     this.warningMessage.show('Une erreur est survenue lors de la sauvegarde de la pièce', displayAxiosError(err));
    //     this.readonly = false;
    //   })
    //   .finally(() => {
    //     this.saveLoading = false;
    //   });
  }

  private updatePiece(piece: PieceSaveDTO) {
    this.saveLoading = true;
    this.readonly = true;
    // FinancierApi.updatePieceComptable(piece)
    //   .then(() => {
    //     this.resolve(piece.numeroPiece);
    //     this.dialog = false;
    //     this.reset();
    //   })
    //   .catch((err) => {
    //     this.warningMessage.show('Une erreur est survenue lors de la mise à jour de la pièce', displayAxiosError(err));
    //     this.readonly = false;
    //   })
    //   .finally(() => {
    //     this.saveLoading = false;
    //   });
  }

  private getModelToSave(): PieceSaveDTO {
    const pieceToSave: PieceSaveDTO = new PieceSaveDTO();
    // if (this.forcerNumero && this.numeroToForce) pieceToSave.numeroPiece = +this.numeroPiece;

    // pieceToSave.periode = this.periode.typePeriodeComptable;
    // pieceToSave.numeroJournal = this.journal.numero;
    // pieceToSave.numeroPiece = this.numeroPiece.toNumber();
    // pieceToSave.datePiece = this.datePiece.toUtc();
    // pieceToSave.soldeInitial = this.soldeInitial.toNumber();
    // pieceToSave.hash = this.hash;
    // pieceToSave.extraits = [];

    // this.extraits.forEach((e) => {
    //   const extrait: ExtraitSaveDTO = new ExtraitSaveDTO();
    //   extrait.numeroExtrait = e.numeroExtrait;
    //   extrait.montantBase = e.montantBase;
    //   extrait.montantDevise = e.montantDevise;
    //   extrait.libelle = e.libelleReglement;
    //   extrait.codeMouvement = e.codeMouvement;
    //   extrait.codeReglement = e.codeReglement;
    //   pieceToSave.extraits.push(extrait);

    //   e.ventilations.forEach((v) => {
    //     const ventilation: VentilationSaveDTO = new VentilationSaveDTO();
    //     ventilation.numeroVentilation = v.numeroVentilation;
    //     ventilation.typeCompte = v.typeCompte;
    //     ventilation.numeroCompte = v.numeroCompte;
    //     ventilation.montantBase = v.montantBase;
    //     ventilation.montantDevise = v.montantDevise;
    //     ventilation.libelle = v.libelle;
    //     ventilation.codeDevise = v.codeDevise;
    //     ventilation.numeroCaseTVA = v.caseTva.numeroCase;
    //     ventilation.codeMouvement = v.codeMouvement;
    //     ventilation.referenceJournal = v.referenceJournal;
    //     ventilation.referencePiece = v.referencePiece;
    //     ventilation.dossier = v.dossier;
    //     extrait.ventilations.push(ventilation);
    //   });
    // });
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
    else this.$nextTick(() => this.refDatePiece.focus());
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
    if(this.readonly) this.closeDialog();
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

#dataTable tbody tr {
  cursor: pointer;
}
</style>
