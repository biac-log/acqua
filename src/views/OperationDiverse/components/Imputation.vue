<template>
  <div
    @keydown.alt.enter.stop="sendImputation()"
    @click:outside="close()"
    @keydown.esc.stop="close()"
    @keydown.46.prevent.stop="deleteImputation"
    class="ma-0 pa-0"
  >
    <div :class="imputationIsSelected ? 'overlay' : ''" @click="close()" />
    <v-form ref="form" v-model="isValid" lazy-validation autocomplete="off">
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
        <v-card-text v-else class="pb-0">
          <v-row dense>
            <v-col cols="3">
              <v-select
                :items="typesComptes"
                v-model="typesComptesSelected"
                label="Type compte"
                item-text="libelle"
                return-object
                :filled="readonly"
                :readonly="readonly"
                :hide-details="readonly"
                :rules="typesComptesRules"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <AutocompleteComptesVue
                ref="autocompleteCompte"
                :Readonly.sync="readonly"
                :TypeCompte.sync="typesComptesSelected.id"
                :hide-details="readonly"
                @Change="compteChange"
              >
              </AutocompleteComptesVue>
            </v-col>
            <v-col cols="5">
              <v-text-field
                label="Nom compte"
                v-model="nomCompte"
                :filled="readonly"
                :hide-details="readonly"
                :rules="nomCompteRules"
                tabindex="-1"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="5">
              <v-text-field
                label="Libellé"
                v-model="libelle"
                :filled="readonly"
                :hide-details="readonly"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Numéro case TVA"
                ref="numeroCaseTva"
                v-model="numeroCaseTva"
                :filled="readonly"
                :readonly="readonly"
                :rules="numeroCaseTvaRules"
                :hide-details="readonly"
                :loading="tvaLoading"
                :disabled="typesComptesSelected.id != 'G'"
                validate-on-blur
                @keypress.enter="loadCaseTvaAsync"
                @change="loadCaseTvaAsync"
                @keydown.ctrl.f.prevent="openSearchCaseTva()"
                :error="numeroCaseTvaError != ''"
                :error-messages="numeroCaseTvaError"
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
            <v-col cols="4">
              <v-text-field
                label="Libellé case TVA"
                v-model="caseTva.libelleCase"
                :filled="readonly"
                :hide-details="readonly"
                :disabled="typesComptesSelected.id != 'G'"
                tabindex="-1"
                readonly
              ></v-text-field>
              <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="3" v-if="dossierIsEnabled">
              <AutocompleteDossierVue
                ref="dossierComponent"
                :readonly.sync="readonly"
                :hide-details="readonly"
                @Change="dossierChange"
              >
              </AutocompleteDossierVue>
            </v-col>
            <v-col cols="9" v-if="dossierIsEnabled">
              <v-text-field
                label="Nom Dossier"
                v-model="nomDossier"
                :filled="readonly"
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
                :filled="readonly"
                :readonly="readonly"
                :rules="devisesRules"
                :hide-details="readonly"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Taux devise"
                readonly
                v-model="taux"
                :filled="readonly"
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
                :filled="readonly"
                :readonly="readonly"
                :rules="typesMouvementsRules"
                :hide-details="readonly"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="montant"
                v-model="montant"
                label="Montant"
                :filled="readonly"
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
                @blur="montant = montant.toNumber().toComptaString()"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="4">
              <v-select
                :items="typesOperation"
                :filled="readonly"
                :readonly="readonly"
                :hide-details="readonly"
                v-model="typesOperationSelected"
                label="Operation"
                item-value="numero"
                item-text="libelle"
                return-object
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field
                ref="reference"
                label="Référence"
                v-model="reference"
                :filled="readonly"
                :readonly="readonly"
                :disabled="!referenceEnabled"
                :hide-details="readonly"
                :rules="referenceRules"
                @keydown.ctrl.f.prevent="openSearchEcheancier()"
                validate-on-blur
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
                :filled="readonly"
                :rules.sync="dateEcheanceRules"
              ></DatePicker>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-text-field
                v-model="chida"
                label="Chiffre d'affaire"
                :filled="readonly"
                :readonly="readonly"
                :rules="chidaRules"
                :hide-details="readonly"
                @blur="chida = chida.toNumber().toComptaString()"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="escompte"
                label="Escompte"
                :filled="readonly"
                :readonly="readonly"
                :rules="escompteRules"
                :hide-details="readonly"
                @blur="escompte = escompte.toNumber().toComptaString()"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="montantTVA"
                label="Montant T.V.A"
                :filled="readonly"
                :readonly="readonly"
                :rules="montantTVARules"
                :hide-details="readonly"
                @blur="montantTVA = montantTVA.toNumber().toComptaString()"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
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

@Component({
  components: { AutocompleteComptesVue, AutocompleteDossierVue, SearchEcheancierVue, DatePicker, SearchCaseTvaVue }
})
export default class ImputationVue extends Vue {
  @Ref('autocompleteCompte') private autocompleteCompte?: AutocompleteComptesVue;
  @Ref('dossierComponent') private autocompleteDossier?: AutocompleteDossierVue;
  @Ref('searchEcheancierDialog') readonly searchEcheancierDialog!: SearchEcheancierVue;

  @PropSync('isReadonly', { default: true }) private readonly!: boolean;
  @PropSync('DatePiece') public datePiece!: DateTime;
  @PropSync('periode') public periodeComptable!: PeriodeComptable;
  @PropSync('journal') public journalPiece!: Journal;
  private isValid = false;
  private imputationIsSelected = false;

  private typesComptes: TypeCompte[] = [];
  private typesComptesSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private numeroCompte = '';
  private nomCompte = '';
  private nomCompteRules: any = [(v: string) => !!v || 'Nom obligatoire'];
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
    return this.typesComptesSelected.id == 'G' && ApplicationModule.parametre.modeDossier;
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

  public open(journal: Journal, numeroPiece: string, imputation: Imputation): Promise<Imputation> {
    this.imputationIsSelected = true;
    this.autocompleteCompte?.resetCompte();
    this.autocompleteDossier?.resetDossier();

    this.setImputation(imputation);

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public openNew(journal: Journal): Promise<Imputation> {
    this.imputationIsSelected = true;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setImputation(imputation: Imputation) {
    this.typesComptesSelected = this.typesComptes.find((tc) => tc.id == imputation.typeCompte) || this.typesComptes[0];
    if (imputation.numeroCompte)
      this.autocompleteCompte?.init(imputation.numeroCompte.toString(), imputation.nomCompte);

    this.nomCompte = imputation.nomCompte;
    this.libelle = imputation.libelle;
    this.idDossier = imputation.dossier;
    this.nomDossier = imputation.dossierNom;
    if (imputation.dossier) this.autocompleteDossier?.init(imputation.dossier, imputation.dossierNom);
    this.devisesSelected = this.devises.find((d) => d.id == imputation.codeDevise) || this.devises[0];
    this.initTauxDeviseAsync(imputation.codeDevise, this.datePiece);
    this.typesMouvementsSelected =
      this.typesMouvements.find((t) => t.id == imputation.codeMouvement) || this.typesMouvements[0];
    this.caseTva = new CaseTva(imputation.caseTva);
    this.typesOperationSelected = this.typesOperation.find((t) => t.numero == imputation.operationNumero) || null;
    this.montant = imputation.montantDevise.toDecimalString();
    this.reference = imputation.libelleReference;
    this.referenceJournal = imputation.referenceJournal;
    this.referencePiece = imputation.referencePiece;
    this.chida = imputation.chida.toDecimalString();
    this.escompte = imputation.escompte.toDecimalString();
    this.montantTVA = imputation.montantTVA.toDecimalString();
  }

  private compteChange(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.nomCompte = '';
    } else if (
      typeof compte === 'string' &&
      (this.typesComptesSelected.id == 'C' || this.typesComptesSelected.id == 'F') &&
      compte.length == 8
    ) {
      //this.loadPieceComptable(compte);
      //this.dossierIsDisabled = true;
      this.natureCompte = '';
      //this.dossierComponent?.resetDossier();
      //this.compteComponent.blur();
      this.$nextTick(() => (this.$refs.montant as any)?.focus());
    } else if (compte instanceof CompteGeneralSearch) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      this.natureCompte = compte.nature;
      //this.setCompteGeneralCaseTvaAsync(compte);
      // if (
      //   this.typesComptesSelected?.id == 'G' &&
      //   (compte.nature == 'R' || compte.nature == 'C') &&
      //   this.dossierIsEnabled
      // ) {
      //   this.dossierIsDisabled = false;
      //   this.dossierComponent?.focus();
      // } else {
      //   this.dossierIsDisabled = true;
      //   this.dossierComponent?.resetDossier();
      //   this.compteComponent.blur();
      //   this.$nextTick(() => (this.$refs.montant as any)?.focus());
      // }
    } else if (compte instanceof CompteSearch || compte instanceof CompteDeTier) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      //this.dossierIsDisabled = true;
      this.natureCompte = '';
      // this.dossierComponent?.resetDossier();
      // this.compteComponent.blur();
      this.$nextTick(() => (this.$refs.reference as any)?.focus());
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
    if (value && value.numero != 3 && !this.dateEcheance) {
      this.dateEcheance = new DateTime(this.datePiece.date);
    }
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

  private openSearchEcheancier(): void {
    if ((this.typesComptesSelected.id == 'C' || this.typesComptesSelected.id == 'F') && this.numeroCompte) {
      (this.$refs.searchEcheancierDialog as SearchEcheancierVue)
        .open(this.typesComptesSelected.id, this.numeroCompte, `${this.numeroCompte} - ${this.nomCompte}`)
        .then((elements) => {
          //this.initFromEcheancier(elements);
          this.$nextTick(() => (this.$refs.montant as any)?.focus());
        })
        .catch(() => {
          this.$nextTick(() => (this.$refs.reference as any)?.focus());
        });
    }
  }

  private initFromEcheancier(elements: EcheancierElement[]) {
    const element = elements[0];
    //this.devisesSelected = this.devises.find((e) => e.id == element.codeDevise) || this.devises[0];
    this.reference = `${element.numeroJournal}.${element.numeroPiece}`;
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
          //this.calculMontant();
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

.notEquilibre {
  color: red;
  margin-left: 10px;
}

.equilibre {
  color: green;
  margin-left: 10px;
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
