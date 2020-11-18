<template>
  <div
    @keydown.alt.enter.stop="sendImputation()"
    @click:outside="close()"
    @keydown.esc.stop="close()"
    @keydown.107.prevent.stop=""
    class="ma-0 pa-0"
  >
    <div :class="imputationIsSelected ? 'overlay' : ''" @click="close()" />
    <v-form ref="form" v-model="isValid" lazy-validation autocomplete="off">
      <span tabindex="1" @focus="focusFirstElement" />
      <v-card outlined id="editImputation">
        <v-toolbar color="primary" dark flat dense>
          <v-card-title class="pa-2">
            Imputation
          </v-card-title>
        </v-toolbar>
        <v-card-text v-if="!imputationIsSelected">
          <v-card>
            <v-card-text>
              Veuillez ajouter ou sélectionner une imputation.
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-text v-show="imputationIsSelected" class="pb-0">
          <v-row dense>
            <v-col cols="3">
              <v-select
                ref="firstElement"
                :items="typesComptes"
                v-model="typesComptesSelected"
                @change="resetCompte"
                label="Type compte"
                item-text="libelle"
                return-object
                outlined
                :readonly="readonly"
                :hide-details="readonly"
                :rules="typesComptesRules"
                tabindex="2"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <AutocompleteComptesVue
                ref="autocompleteCompte"
                :Readonly.sync="readonly"
                :typeCompte.sync="typesComptesSelected.id"
                :hide-details="readonly"
                :rules="compteRules"
                label="Compte"
                @change="compteChange"
                tabindex="3"
              >
              </AutocompleteComptesVue>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                ref="refLibelle"
                label="Libellé"
                v-model="libelle"
                outlined
                :hide-details="readonly"
                :readonly="readonly"
                tabindex="4"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="4">
              <v-text-field
                label="Numéro case TVA"
                ref="numeroCaseTva"
                v-model="numeroCaseTva"
                outlined
                :readonly="readonly"
                :rules="numeroCaseTvaRules"
                hide-details="auto"
                :loading="tvaLoading"
                :disabled="typesComptesSelected.id != 'G'"
                validate-on-blur
                @keypress.enter="loadCaseTvaAsync"
                @change="loadCaseTvaAsync"
                @keydown.ctrl.f.prevent="openSearchCaseTva()"
                @keydown.f5.prevent="openSearchCaseTva()"
                :error="numeroCaseTvaError != ''"
                :error-messages="numeroCaseTvaError"
                tabindex="5"
                :suffix="caseTva.libelleCase"
                :hint="caseTva.libelleNatureCase"
                persistent-hint
              >
                <template v-slot:append>
                  <v-tooltip top open-delay="500">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        small
                        :disabled="readonly"
                        @click="openSearchCaseTva()"
                        @keydown.enter.prevent.stop="openSearchCaseTva()"
                        tabindex="-1"
                        v-on="on"
                      >
                        <v-icon>mdi-magnify</v-icon>
                      </v-btn>
                    </template>
                    <span>Recherche case TVA<span class="shortcutTooltip">ctrl + f</span></span>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="dossierIsEnabled">
              <AutocompleteDossierVue
                ref="dossierComponent"
                :readonly.sync="readonly"
                :hide-details="readonly"
                @Change="dossierChange"
                tabindex="6"
              >
              </AutocompleteDossierVue>
            </v-col>
            <v-col cols="9" v-if="dossierIsEnabled">
              <v-text-field
                label="Nom Dossier"
                v-model="nomDossier"
                outlined
                :hide-details="readonly"
                :disabled="dossierIsDisabled"
                tabindex="-1"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3">
              <v-select
                :items="devises"
                v-model="devisesSelected"
                label="Devise"
                item-value="id"
                item-text="libelle"
                return-object
                outlined
                :readonly="readonly"
                :rules="devisesRules"
                :hide-details="readonly"
                tabindex="7"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Taux devise"
                readonly
                v-model="taux"
                outlined
                :hide-details="readonly"
                tabindex="-1"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select
                :items="typesMouvements"
                v-model="typesMouvementsSelected"
                label="Type de mouvement"
                item-value="id"
                item-text="libelle"
                return-object
                outlined
                :readonly="readonly"
                :rules="typesMouvementsRules"
                :hide-details="readonly"
                tabindex="8"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="refMontant"
                v-model="montant"
                label="Montant"
                outlined
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
                @blur="montant = montant.toNumber().toComptaString()"
                tabindex="9"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="4">
              <v-select
                :items="typesOperation"
                outlined
                :readonly="readonly"
                :hide-details="readonly"
                v-model="typesOperationSelected"
                label="Operation"
                item-value="numero"
                item-text="libelle"
                :disabled="compteGeneralSelected"
                return-object
                tabindex="10"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field
                ref="refReference"
                label="Référence"
                v-model="reference"
                outlined
                :readonly="readonly"
                :disabled="!referenceEnabled"
                :hide-details="readonly"
                :rules="referenceRules"
                :error-messages="errorReference"
                :loading="loadingReference"
                @change="loadPieceComptable(reference)"
                @keydown.ctrl.f.prevent="openSearchEcheancier()"
                @keydown.f5.prevent="openSearchEcheancier()"
                validate-on-blur
                tabindex="11"
              >
                <template v-slot:append>
                  <v-tooltip top open-delay="500">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        small
                        v-show="!readonly"
                        :disabled="!referenceEnabled"
                        @click="openSearchEcheancier()"
                        @keydown.enter.prevent.stop="openSearchEcheancier()"
                        tabindex="-1"
                        v-on="on"
                      >
                        <v-icon>mdi-magnify</v-icon>
                      </v-btn>
                    </template>
                    <span>Recherche dans l'échéancier<span class="shortcutTooltip">ctrl + f</span></span>
                  </v-tooltip>
                </template>
              </v-text-field>
              <SearchEcheancierVue ref="searchEcheancierDialog"></SearchEcheancierVue>
            </v-col>
            <v-col cols="4">
              <DatePicker
                ref="refDateEcheance"
                label="Date échéance"
                :date.sync="dateEcheance"
                :readonly.sync="readonly"
                outlined
                :disabled.sync="compteGeneralSelected"
                :rules.sync="dateEcheanceRules"
                tabindex="12"
              ></DatePicker>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-text-field
                v-model="chida"
                label="Chiffre d'affaire"
                outlined
                :readonly="readonly"
                :rules="chidaRules"
                :hide-details="readonly"
                :disabled="compteGeneralSelected"
                @blur="chida = chida.toNumber().toComptaString()"
                tabindex="13"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="escompte"
                label="Escompte"
                outlined
                :readonly="readonly"
                :rules="escompteRules"
                :hide-details="readonly"
                :disabled="compteGeneralSelected"
                @blur="escompte = escompte.toNumber().toComptaString()"
                tabindex="14"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="montantTVA"
                label="Montant T.V.A"
                outlined
                :readonly="readonly"
                :rules="montantTVARules"
                :hide-details="readonly"
                :disabled="compteGeneralSelected"
                @blur="montantTVA = montantTVA.toNumber().toComptaString()"
                tabindex="15"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions v-if="imputationIsSelected" class="text-center pt-0">
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                color="error"
                class="ma-2 pr-4"
                text
                tabindex="-1"
                v-if="!isAdd && !readonly"
                @click="deleteImputation()"
                dense
                v-on="on"
              >
                Supprimer
              </v-btn>
            </template>
            <span>Supprimer l'imputation<span class="shortcutTooltip">del</span></span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn color="blue darken-1" class="ma-2 pr-4" tile outlined @click="close()" tabindex="-1" v-on="on">
                <v-icon left>mdi-close</v-icon> Fermer
              </v-btn>
            </template>
            <span>Fermer <span class="shortcutTooltip">esc</span></span>
          </v-tooltip>
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                ref="btnValidate"
                class="ma-2 pr-4"
                tile
                color="success"
                v-if="!readonly"
                :disabled="!isValid"
                @click="sendImputation()"
                @keydown.tab.prevent="focusFirstElement"
                v-on="on"
                tabindex="16"
              >
                <v-icon left>mdi-check</v-icon> Valider
              </v-btn>
            </template>
            <span>Valider les modifications <span class="shortcutTooltip">alt + enter</span></span>
          </v-tooltip>
          <span tabindex="99" @focus="focusFirstElement" />
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import { Imputation, Journal } from '@/models/OperationDiverse';
import OperationDiverseApi from '@/api/OperationDiverseApi';
import { DateTime } from '@/models/DateTime';
import { TypeCompte } from '@/models/Compte/TypeCompte';
import DeviseApi from '@/api/DeviseApi';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import AutocompleteDossierVue from '@/components/autocomplete/AutocompleteDossier.vue';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { DossierSearch } from '@/models/Dossier/DossierSearch';
import { ApplicationModule } from '@/store/modules/application';
import { Devise } from '@/models/Devise/Devise';
import { TypeMouvement, getTypesMouvements } from '@/models/TypeMouvement/TypeMouvement';
import TypeOperation from '@/models/OperationDiverse/TypeOperation';
import SearchEcheancierVue from '@/components/search/SearchEcheancier.vue';
import { EcheancierElement } from '@/models/Echeancier';
import DatePicker from '@/components/DatePicker.vue';
import { PeriodeComptable } from '@/models/AchatVente';
import { CaseTva } from '@/models/CaseTva';
import CaseTvaApi from '@/api/CaseTvaApi';
import SearchCaseTvaVue from '@/components/search/SearchCaseTva.vue';
import { FinancierApi } from '@/api/FinancierApi';

@Component({
  components: { AutocompleteComptesVue, AutocompleteDossierVue, SearchEcheancierVue, DatePicker, SearchCaseTvaVue }
})
export default class ImputationVue extends Vue {
  @Ref('autocompleteCompte') private autocompleteCompte?: AutocompleteComptesVue;
  @Ref('dossierComponent') private autocompleteDossier?: AutocompleteDossierVue;
  @Ref('searchEcheancierDialog') readonly searchEcheancierDialog!: SearchEcheancierVue;
  @Ref('firstElement') readonly firstElement!: HTMLElement;
  @Ref('refLibelle') readonly refLibelle!: HTMLElement;
  @Ref('refMontant') readonly refMontant!: HTMLElement;
  @Ref('refReference') readonly refReference!: HTMLElement;

  @PropSync('isReadonly', { default: true }) private readonly!: boolean;
  @PropSync('DatePiece') public datePiece!: DateTime;
  @PropSync('periode') public periodeComptable!: PeriodeComptable;
  @PropSync('journal') public journalPiece!: Journal;

  private isValid = false;
  private imputationIsSelected = false;
  private isAdd = false;
  private numeroVentilation = 0;
  private typesComptes: TypeCompte[] = [];
  private typesComptesSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private numeroCompte = '';
  private compteRules: any = [(v: string) => !!v || 'Un compte est obligatoire'];
  private nomCompte = '';
  private natureCompte = '';

  private libelle = '';
  private libelleRules: any = [(v: string) => !!v || 'Libelle obligatoire'];

  private idDossier = '';
  private nomDossier = '';

  private devises: Devise[] = [];
  private devisesSelected: Devise = new Devise();
  private devisesRules: any = [(v: string) => !!v || 'Devise obligatoire'];
  private taux = '';

  private typesMouvements: TypeMouvement[] = getTypesMouvements();
  private typesMouvementsSelected: TypeMouvement = new TypeMouvement();
  private typesMouvementsRules: any = [(v: string) => !!v || 'Type obligatoire'];
  private montant = '';
  private montantRules: any = [
    (v: string) => !!v || 'Montant obligatoire',
    (v: string) => v.isDecimal() || 'Montant invalide'
  ];

  private caseTva: CaseTva = new CaseTva();
  private numeroCaseTva = '';
  private numeroCaseTvaError = '';
  private numeroCaseTvaRules: any = [(v: string) => !v || (v.isInt() && v.toNumber() != 0) || 'Numéro invalide'];
  private tvaLoading = false;

  private get compteGeneralSelected() {
    return this.typesComptesSelected.id != 'C' && this.typesComptesSelected.id != 'F';
  }
  private typesOperation: TypeOperation[] = TypeOperation.getAllOperations();
  private typesOperationSelected: TypeOperation | null = null;

  private get referenceEnabled() {
    return this.typesComptesSelected && this.typesComptesSelected.id != 'G';
  }
  private reference = '';
  private referenceRules: any = [
    (v: string) => !v || (v.isInt() && v.length == 8) || v.length == 9 || 'Référence invalide'
  ];
  private referenceJournal = 0;
  private referencePiece = 0;
  private errorReference = '';
  private loadingReference = false;

  private dateEcheance: DateTime | null = null;
  private dateEcheanceRules: any = [
    (v: string) => DateTime.isValid(v) || 'Date invalide',
    (v: string) => this.validateDateEcheance(v) || 'La date est hors période'
  ];

  private chida = '';
  private chidaRules: any = [(v: string) => v.isDecimal() || 'Montant invalide'];
  private escompte = '';
  private escompteRules: any = [(v: string) => v.isDecimal() || 'Montant invalide'];
  private montantTVA = '';
  private montantTVARules: any = [(v: string) => v.isDecimal() || 'Montant invalide'];

  get dossierIsEnabled() {
    return (
      this.typesComptesSelected.id == 'G' &&
      ApplicationModule.parametre.modeDossier &&
      (this.natureCompte == 'C' || this.natureCompte == 'R')
    );
  }
  get dossierIsDisabled() {
    return !this.dossierIsEnabled;
  }

  private warningMessage = '';
  private resolve: any;
  private reject: any;

  mounted() {
    OperationDiverseApi.getTypesComptesOD().then((resp) => {
      this.typesComptes = resp;
    });
    DeviseApi.getAllDevises().then((resp) => {
      this.devises = resp;
    });
  }

  public open(imputation: Imputation): Promise<Imputation> {
    this.imputationIsSelected = true;
    this.isAdd = false;
    this.autocompleteCompte?.resetCompte();
    this.autocompleteDossier?.resetDossier();

    this.setImputation(imputation);
    this.$nextTick(() => this.firstElement?.focus());

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public openNew(): Promise<Imputation> {
    this.imputationIsSelected = true;
    this.isAdd = true;
    this.autocompleteCompte?.resetCompte();
    this.autocompleteDossier?.resetDossier();

    this.setImputation(new Imputation());
    this.$nextTick(() => this.firstElement?.focus());

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setImputation(imputation: Imputation) {
    this.numeroVentilation = imputation.numeroVentilation;
    this.typesComptesSelected = this.typesComptes.find((tc) => tc.id == imputation.typeCompte) || this.typesComptes[0];
    if (imputation.numeroCompte)
      this.autocompleteCompte?.init(imputation.numeroCompte.toString(), imputation.nomCompte);

    this.nomCompte = imputation.nomCompte;
    this.natureCompte = imputation.natureCompte;
    this.libelle = imputation.libelle;
    this.idDossier = imputation.dossier;
    this.nomDossier = imputation.dossierNom;
    if (imputation.dossier) this.autocompleteDossier?.init(imputation.dossier, imputation.dossierNom);
    this.devisesSelected = this.devises.find((d) => d.id == imputation.codeDevise) || this.devises[0];
    this.initTauxDeviseAsync(this.devisesSelected.id, this.datePiece);
    this.typesMouvementsSelected =
      this.typesMouvements.find((t) => t.id == imputation.codeMouvement) || this.typesMouvements[0];
    this.caseTva = new CaseTva(imputation.caseTva);
    this.typesOperationSelected = this.typesOperation.find((t) => t.numero == imputation.operationNumero) || null;
    this.montant = imputation.montantDevise.toDecimalString();
    this.reference = imputation.libelleReference;
    this.referenceJournal = imputation.referenceJournal;
    this.referencePiece = imputation.referencePiece;
    this.dateEcheance = imputation.dateEcheanceDate;
    this.chida = imputation.chida.toDecimalString();
    this.escompte = imputation.escompte.toDecimalString();
    this.montantTVA = imputation.montantTVA.toDecimalString();
  }

  private resetCompte() {
    this.autocompleteCompte?.resetCompte();
  }

  private compteChange(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.nomCompte = '';
    } else if (compte instanceof CompteGeneralSearch) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      this.natureCompte = compte.nature;
      this.setCompteGeneralCaseTvaAsync(compte);
      this.autocompleteCompte?.blur();
      this.refLibelle?.focus();
    } else if (compte instanceof CompteSearch || compte instanceof CompteDeTier) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      this.natureCompte = '';
      this.autocompleteDossier?.resetDossier();
      this.autocompleteCompte?.blur();
      this.refLibelle?.focus();
    }
  }

  private async setCompteGeneralCaseTvaAsync(compte: CompteGeneralSearch) {
    if (compte.numeroCase) {
      const caseTva = await CaseTvaApi.getCaseTVA(compte.numeroCase, this.journalPiece.numero);
      if (caseTva) {
        this.caseTva = caseTva;
        this.numeroCaseTva = compte.numeroCase.toString();
      } else {
        this.caseTva = new CaseTva();
        this.numeroCaseTva = '';
      }
    }
  }

  private dossierChange(dossier: DossierSearch) {
    this.idDossier = dossier.idDossier;
    this.nomDossier = dossier.nom;
    if (this.datePiece && dossier.idDossier && !dossier.dossierIsActif(this.datePiece))
      this.warningMessage = `Attention, le dossier ${
        dossier.idDossier
      } n'est pas actif à la date du ${this.datePiece.toString()}`;
    else this.warningMessage = '';

    this.$nextTick(() => (this.$refs.montant as any)?.focus());
  }

  private async initDevisesAsync(deviseJournal: Devise, imputation?: Imputation) {
    this.devises = [];
    this.devises.push(new Devise({ id: 1, libelle: 'EUR', typeDevise: 'D' }));
    if (deviseJournal && !this.devises.find((d) => d.id == deviseJournal.id)) this.devises.push(deviseJournal);
    if (imputation && imputation.codeDevise != 0) {
      if (!this.devises.find((d) => d.id == imputation.codeDevise)) {
        this.devises.push(
          new Devise({
            id: imputation.codeDevise,
            libelle: imputation.libelleDevise,
            typeDevise: this.devisesSelected.typeDevise
          })
        );
        this.devisesSelected = this.devises.find((d) => d.id == imputation.codeDevise) || this.devises[0];
      } else this.devisesSelected = this.devises[0];
    }

    await this.initTauxDeviseAsync(this.devisesSelected.id, this.datePiece);
  }

  @Watch('datePiece')
  @Watch('devisesSelected', { deep: true })
  private deviseSelectedChanged() {
    if (!this.readonly && this.devisesSelected && this.datePiece.isValid()) {
      this.initTauxDeviseAsync(this.devisesSelected.id, this.datePiece);
    }
  }

  @Watch('typesOperationSelected')
  private typeOperationSelectedChange(value: TypeOperation) {
    if (this.isAdd && value && value.numero != 3 && !this.dateEcheance) {
      this.dateEcheance = new DateTime(this.datePiece.date);
    } else this.dateEcheance = null;
  }

  private async initTauxDeviseAsync(numeroDevise: number, datePiece: DateTime) {
    try {
      if (!numeroDevise || numeroDevise == 1) this.taux = '1,000000';
      else if (datePiece.isValid() && numeroDevise) {
        const taux = await DeviseApi.getTaux(numeroDevise, datePiece);
        if (taux == 0) this.taux = '1,000000';
        else this.taux = taux.toDecimalString(6);
      }
    } catch {
      this.taux = '1,000000';
    }
  }

  private loadPieceComptable(piece: string) {
    this.referenceJournal = 0;
    this.referencePiece = 0;
    this.errorReference = '';

    if (piece && piece.length == 8) {
      const numeroJournal = piece.substring(0, 2);
      const numeroPiece = piece.substring(2, 8);
      this.reference = `${numeroJournal}.${numeroPiece}`;
      this.loadingReference = true;

      FinancierApi.getPieceAchatVente(numeroJournal.toNumber(), numeroPiece.toNumber())
        .then((piece) => {
          if (piece) {
            this.referenceJournal = piece.numeroJournal;
            this.referencePiece = piece.numeroPiece;
            this.refMontant?.focus();
          } else this.errorReference = "La pièce n'existe pas";
        })
        .catch(() => {
          this.errorReference = "La pièce n'existe pas";
          this.refReference?.focus();
        })
        .finally(() => {
          this.loadingReference = false;
        });
    }
  }

  private openSearchEcheancier(): void {
    if ((this.typesComptesSelected.id == 'C' || this.typesComptesSelected.id == 'F') && this.numeroCompte) {
      (this.$refs.searchEcheancierDialog as SearchEcheancierVue)
        .open(this.typesComptesSelected.id, this.numeroCompte, `${this.numeroCompte} - ${this.nomCompte}`)
        .then((elements) => {
          this.initFromEcheancier(elements);
          this.refMontant?.focus();
        })
        .catch(() => {
          this.refReference?.focus();
        });
    }
  }

  private initFromEcheancier(elements: EcheancierElement[]) {
    const element = elements[0];
    //this.devisesSelected = this.devises.find((e) => e.id == element.codeDevise) || this.devises[0];
    this.reference = `${element.numeroJournal.toString().padStart(2, '0')}.${element.numeroPiece}`;
    this.referenceJournal = element.numeroJournal;
    this.referencePiece = element.numeroPiece;
  }

  private validateDateEcheance(date: string): boolean {
    const dateTime = new DateTime(date);
    return dateTime.isBetween(this.periodeComptable.dateDebut, this.periodeComptable.dateFin);
  }

  private async loadCaseTvaAsync() {
    try {
      if (this.readonly) return;
      this.tvaLoading = true;
      if (this.numeroCaseTva?.isInt() && this.numeroCaseTva) {
        this.tvaLoading = true;
        this.numeroCaseTvaError = '';
        const caseTva = await CaseTvaApi.getCaseTVA(this.numeroCaseTva, this.journalPiece.numero);
        if (caseTva) {
          this.numeroCaseTva = caseTva.numeroCase.toString();
          this.caseTva = caseTva;
          this.numeroCaseTvaError = '';
        }
      } else {
        this.caseTva.refresh();
        this.caseTva = new CaseTva();
      }
    } catch (err) {
      this.caseTva = new CaseTva();
      this.numeroCaseTvaError = 'Numéro invalide';
    } finally {
      this.tvaLoading = false;
    }
  }

  private openSearchCaseTva(): void {
    (this.$refs.caseTvaDialog as SearchCaseTvaVue)
      .open(this.journalPiece.numero)
      .then((caseTva) => {
        this.numeroCaseTva = caseTva.numeroCase.toString();
        this.caseTva = caseTva;
        this.numeroCaseTvaError = '';
        this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
      })
      .catch(() => {
        this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus());
      });
  }

  private focusFirstElement() {
    this.$nextTick(() => this.firstElement?.focus());
  }

  private sendImputation() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.imputationIsSelected = false;
        this.resolve(this.getModel());
      }
    });
  }

  private deleteImputation() {
    this.imputationIsSelected = false;
    this.resolve();
  }

  @Watch('typesComptesSelected')
  private typeCompteChange(typeCompte: TypeCompte) {
    if (typeCompte.id != 'C' && typeCompte.id != 'F') {
      this.typesOperationSelected = null;
      this.reference = '';
      this.referenceJournal = 0;
      this.referencePiece = 0;
      this.dateEcheance = null;
      this.chida = '';
      this.escompte = '';
      this.montantTVA = '';
    }
  }

  private getModel(): Imputation {
    const imputation = new Imputation();
    imputation.numeroVentilation = this.numeroVentilation;
    imputation.typeCompte = this.typesComptesSelected.id;
    imputation.numeroCompte = this.numeroCompte.toNumber();
    imputation.nomCompte = this.nomCompte;
    imputation.natureCompte = this.natureCompte;
    imputation.dossier = this.idDossier;
    imputation.dossierNom = this.nomDossier;
    imputation.referenceJournal = this.referenceJournal;
    imputation.referencePiece = this.referencePiece;
    imputation.libelle = this.libelle;
    imputation.codeMouvement = this.typesMouvementsSelected.id;
    imputation.montantDevise = this.montant.toNumber();
    imputation.montantBase = this.montant.toNumber();
    imputation.codeDevise = this.devisesSelected?.id;
    imputation.libelleDevise = this.devisesSelected?.libelle;
    imputation.codeCaseTVA = this.caseTva?.numeroCase;
    imputation.libelleCaseTVA = this.caseTva?.libelleCase;
    imputation.dateEcheanceDate = this.dateEcheance;
    imputation.caseTva = new CaseTva(this.caseTva);
    imputation.operationNumero = this.typesOperationSelected ? this.typesOperationSelected.numero : 0;
    imputation.operationLibelle = this.typesOperationSelected ? this.typesOperationSelected.libelle : '';
    imputation.chida = this.chida.toNumber();
    imputation.escompte = this.escompte.toNumber();
    imputation.montantTVA = this.montantTVA.toNumber();

    return imputation;
  }

  public close() {
    this.numeroCaseTvaError = '';
    if (this.imputationIsSelected) {
      this.imputationIsSelected = false;
      if (this.reject) this.reject();
    }
  }
}
</script>

<style scoped>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}

#editImputation {
  z-index: 999;
}

.overlay {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 2;
  cursor: pointer;
}
</style>
