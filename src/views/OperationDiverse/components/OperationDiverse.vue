<template>
  <v-dialog
    v-model="dialog"
    scrollable
    eager
    width="85%"
    :persistent="!readonly || saveLoading || deleteLoading"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierPiece()"
    @keydown.107.prevent.stop="createImputation()"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="savePiece()"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card :loading="pieceIsLoading">
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <p class="mb-0" v-if="!newRecord">Pièce {{ journal.numero }}.{{ numeroPiece }}</p>
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
        <v-progress-linear
          :active="pieceIsLoading"
          :indeterminate="pieceIsLoading"
          top
          color="primary accent-4"
        ></v-progress-linear>
        <v-card-text class="pb-0 pt-0">
          <v-row>
            <v-col cols="12" lg="7" md="12" class="pr-5">
              <v-row fill-height no-gutters>
                <v-row dense>
                  <v-col cols="3">
                    <DatePicker
                      ref="refDatePiece"
                      name="datePiece"
                      label="Date pièce"
                      :date.sync="datePiece"
                      :readonly.sync="readonly"
                      :rules.sync="datePieceRules"
                      :hide-details="readonly"
                      outlined
                    ></DatePicker>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Libellé"
                      v-model="libellePiece"
                      :hide-details="readonly"
                      counter
                      maxlength="23"
                      outlined
                      :readonly="readonly"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Débit"
                      :value="debit | numberToString"
                      :hide-details="readonly"
                      readonly
                      tabindex="-1"
                      outlined
                      :suffix="journal.devise.libelle"
                      class="text-end-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      label="Crédit"
                      :value="credit | numberToString"
                      :hide-details="readonly"
                      readonly
                      tabindex="-1"
                      outlined
                      :suffix="journal.devise.libelle"
                      class="text-end-input"
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
                                ref="btnAddImputation"
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
                        <v-spacer></v-spacer>
                        <span :class="!solde || solde == 0 ? 'equilibre' : 'notEquilibre'">
                          Montant à ventiler :
                          <b
                            >{{ solde | numberToStringEvenZero }}
                            {{ this.journal.devise ? this.journal.devise.libelle : 'EUR' }}</b
                          >
                        </span>
                      </v-toolbar>
                      <v-data-table
                        id="dataTable"
                        :headers="headersImputations"
                        :items="imputations"
                        @click:row="openImputation"
                        dense
                        disable-pagination
                        hide-default-footer
                        disable-sort
                        :height="$vuetify.breakpoint.lgAndUp ? 608 : ''"
                        ><!-- 608px -> 19*32px (element height) -->
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
            <v-col cols="12" lg="5" md="12">
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
        <v-card-actions>
          <AlertMessageVue ref="warningMessage" type="warning"></AlertMessageVue>
        </v-card-actions>
        <v-divider v-if="saveLoading || deleteLoading || !readonly"></v-divider>
        <v-card-actions v-if="saveLoading || deleteLoading || !readonly" class="d-flex">
          <v-tooltip v-if="!newRecord" top open-delay="500">
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
            <span tabindex="99" @focus="focusFirstElement" />
          </v-tooltip>
        </v-card-actions>
        <Confirm ref="confirmDialog"></Confirm>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import {
  PeriodeComptable,
  EntetePieceComptable,
  Journal,
  PieceComptable,
  Imputation,
  OperationDiverseToSave,
} from '@/models/OperationDiverse';
import { DateTime } from '@/models/DateTime';
import AlertMessageVue from '@/components/AlertMessage.vue';
import DatePicker from '@/components/DatePicker.vue';
import ImputationVue from './Imputation.vue';
import OperationDiverseApi from '../../../api/OperationDiverseApi';
import Confirm from '@/components/Confirm.vue';
import { displayAxiosError } from '@/utils/ErrorMethods';
import { sum } from 'lodash';

@Component({
  components: { ImputationVue, DatePicker, Confirm, AlertMessageVue },
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
  private newRecord = false;

  private periode = new PeriodeComptable();
  private journal = new Journal();
  private numeroPiece = '';

  private datePieceDialog = false;
  private datePiece: DateTime = new DateTime();
  private datePieceRules: any = [
    (v: string) => !!v || 'Date obligatoire',
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDatePiece(v) || 'La date est hors période',
  ];
  private libellePiece = '';

  get credit() {
    return sum(this.imputations.filter((c) => c.codeMouvement == 'CR').map((i) => i.montantDevise));
  }
  get debit() {
    return sum(this.imputations.filter((c) => c.codeMouvement == 'DB').map((i) => i.montantDevise));
  }
  get solde() {
    return Math.abs(this.credit - this.debit);
  }
  private imputations: Imputation[] = [];
  private headersImputations = [
    { text: 'Compte', value: 'libelleCompte' },
    { text: 'Libellé écriture', value: 'libelle' },
    { text: 'Débit', value: 'debit' },
    { text: 'Crédit', value: 'credit' },
    { text: 'Devise', value: 'libelleDevise' },
    { text: 'Divers', value: 'libelleReference' },
    { text: 'Case TVA', value: 'libelleCaseTVA', align: 'end' },
  ];

  private forcerNumero = false;
  private numeroToForce = '';
  private numeroToForceRules: any = [
    (v: string) => !!v || 'Numéro obligatoire',
    (v: string) => !!v.toNumber() || 'Numéro invalide',
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
    this.newRecord = true;
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
    this.newRecord = false;
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
      const previousLibelle = this.imputations[this.imputations.length - 1]?.libelle ?? '';
      this.refImputationVue
        .openNew(previousLibelle)
        .then((resp: Imputation) => {
          if (resp) {
            const maxLigne = this.imputations?.length
              ? Math.max(...this.imputations.map((i) => i.numeroVentilation))
              : 0;
            resp.numeroVentilation = maxLigne + 1;
            this.imputations.push(resp);
            this.createImputation();
          } else this.$nextTick(() => this.btnAddImputation?.$el?.focus());
        })
        .catch(() => {
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
      .catch();
  }

  private init(piece: PieceComptable) {
    this.oldPiece = new PieceComptable(piece);
    this.numeroPiece = piece.numeroPiece.toString();
    this.datePiece = new DateTime(piece.datePiece);
    this.libellePiece = piece.libelle;
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
    this.libellePiece = '';
    this.hash = '';
    (this.$refs.extraits as any)?.reset();
    (this.$refs.form as any).resetValidation();
    this.newRecord = false;
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
          OperationDiverseApi.deletePieceComptable(
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
      if (this.isValid && (await this.confirmTva())) {
        const pieceToSave = this.getModelToSave();
        if (!this.oldPiece) this.addPiece(pieceToSave);
        else this.updatePiece(pieceToSave);
      }
    });
  }

  private async confirmTva(): Promise<boolean> {
    try {
      if (!this.isEquilibree())
        return await (this.confirmDialog as Confirm).open(
          'Attention, pièce non équilibrée',
          `La pièce n'est pas équilibrée, voulez-vous sauvegarder ?`,
          'error',
          'Sauvegarder'
        );
      if (this.errorInTVA())
        return await (this.confirmDialog as Confirm).open(
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

  private addPiece(piece: OperationDiverseToSave) {
    this.saveLoading = true;
    this.readonly = true;

    OperationDiverseApi.addPiece(piece)
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

  private updatePiece(piece: OperationDiverseToSave) {
    this.saveLoading = true;
    this.readonly = true;
    OperationDiverseApi.updatePieceComptable(piece)
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

  private getModelToSave(): OperationDiverseToSave {
    const pieceToSave: OperationDiverseToSave = new OperationDiverseToSave();
    if (this.forcerNumero && this.numeroToForce) pieceToSave.numeroPiece = +this.numeroPiece;
    else if (this.oldPiece) pieceToSave.numeroPiece = this.oldPiece.numeroPiece;
    pieceToSave.numeroJournal = this.journal.numero;
    pieceToSave.periode = this.periode.typePeriodeComptable;
    pieceToSave.datePiece = this.datePiece.toJsonDateTime();
    pieceToSave.libellePiece = this.libellePiece;
    this.imputations.forEach((i) => pieceToSave.imputations.push(i.toSaveModel()));
    pieceToSave.hash = this.hash;
    return pieceToSave;
  }

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
    else if (this.oldPiece) {
      this.readonly = true;
      this.init(this.oldPiece);
    } else {
      this.closeDialog();
    }
  }

  private focusFirstElement() {
    this.$nextTick(() => this.refDatePiece.focus());
  }

  private closeDialog() {
    if (!this.readonly) {
      this.confirmDialog
        .open('Fermer', `Êtes-vous sûr de vouloir fermer ? Ceci annulera vos modifications.`, 'warning', 'Fermer')
        .then((resp) => {
          if (resp) {
            this.reset();
            this.dialog = false;
            this.reject();
          }
        });
    } else {
      this.reset();
      this.dialog = false;
      this.reject();
    }
  }

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }

  private getTvaCalcule(): number {
    if (!this.imputations) return 0;

    const montantsCaseTva: { case: number; caseTaux: number; montant: number }[] = [];
    this.imputations.forEach((element) => {
      const montantCase = montantsCaseTva.find((c) => c.case == element.caseTva.numeroCase);
      if (montantCase) montantCase.montant += element.credit - element.debit;
      else if (element.caseTva.typeCase > 0 && element.caseTva.typeCase < 4) {
        montantsCaseTva.push({
          case: element.caseTva.numeroCase,
          caseTaux: element.caseTva.tauxTvaCase,
          montant: element.credit - element.debit,
        });
      }
    });

    return montantsCaseTva
      .map((c) => ((c.montant * c.caseTaux) / 100).toDecimalString(2).toNumber())
      .reduce((a, b) => a + b, 0)
      .toDecimalString(this.journal.devise.typeDevise == 'E' ? 0 : 2)
      .toNumber();
  }

  private getTvaImpute(): number {
    if (!this.imputations) return 0;

    return this.imputations
      .filter((c) => [50, 51].includes(c.caseTva.typeCase) && c.codeDevise == this.journal.devise.id)
      .map((c) => c.credit - c.debit)
      .reduce((a, b) => a + b, 0);
  }

  private errorInTVA(): boolean {
    return this.getTvaCalcule() != this.getTvaImpute();
  }

  private isEquilibree(): boolean {
    return this.solde == 0;
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

.text-end-input input {
  text-align: end !important;
}
</style>
