<template>
  <div
    @keydown.alt.enter.prevent.stop="sendVentilation()"
    @click:outside="close()"
    @keydown.esc.stop="close()"
    @keydown.107.prevent.stop=""
    class="ma-0 pa-0"
  >
    <div :class="ventilationIsSelected ? 'overlay' : ''" @click="close()" />
    <v-form ref="form" v-model="isValid" lazy-validation autocomplete="off">
      <v-card outlined id="editVentilation">
        <v-toolbar color="primary" dark flat dense>
          <v-card-title class="pa-2"> Ventilation </v-card-title>
          <v-spacer />
          <v-btn
            v-if="ventilationIsSelected && typesComptesSelected == typesComptes[2]"
            color="success"
            @click="openSuggestion"
            >Comptes prédéfinis</v-btn
          >
        </v-toolbar>
        <v-card-text v-if="!ventilationIsSelected">
          <v-card>
            <v-card-text> Veuillez ajouter ou sélectionner une ventilation. </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-text v-else class="pb-0">
          <v-row dense>
            <v-col cols="4">
              <v-select
                ref="refTypesComptes"
                :items="typesComptes"
                v-model="typesComptesSelected"
                label="Type compte"
                item-text="libelle"
                return-object
                outlined
                :readonly="readonly"
                :hide-details="readonly"
                :rules="typesComptesRules"
                @change="resetCompte"
                autofocus
                @keyup="changeType"
              ></v-select>
            </v-col>
            <v-col cols="8">
              <AutocompleteComptesVue
                ref="compteComponent"
                :readonly.sync="readonly"
                :typeCompte.sync="typesComptesSelected.id"
                :rules.sync="numeroCompteRules"
                label="Compte"
                outlined
                @change="compteChange"
              >
              </AutocompleteComptesVue>
            </v-col>
            <compte-general-suggestion ref="compteGeneralSuggestion" />
          </v-row>
          <v-row dense>
            <v-col cols="7" v-if="['F', 'C'].some((type) => type == typesComptesSelected.id)">
              <v-text-field
                ref="reference"
                label="Référence"
                v-model="reference"
                outlined
                :readonly="readonly"
                :disabled="typesComptesSelected.id == 'G'"
                :hide-details="readonly"
                :rules="referenceRules"
                @change="loadPieceComptable(reference)"
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
                        :disabled="readonly"
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
              <SearchEcheancierVue
                :MontantAVentileDevise.sync="ventileDevise"
                :MontantAVentileBase.sync="ventileBase"
                ref="searchEcheancierDialog"
              ></SearchEcheancierVue>
            </v-col>
            <v-col cols="3" v-if="typesComptesSelected.id == 'G' && dossierIsEnabled">
              <AutoCompleteDossierVue
                ref="dossierComponent"
                :disabled.sync="dossierIsDisabled"
                :required="true"
                @Change="dossierChange"
              >
              </AutoCompleteDossierVue>
            </v-col>
            <v-col cols="4" v-if="typesComptesSelected.id == 'G' && dossierIsEnabled">
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
            <v-col :cols="this.typesComptesSelected.id != 'G' || this.dossierIsEnabled ? 5 : 12">
              <v-text-field
                ref="libelleComponent"
                label="Libellé"
                v-model="libelle"
                counter
                maxlength="23"
                outlined
                :readonly="readonly"
                :rules="libelleRules"
                :hide-details="readonly"
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
                :suffix="devisesSelected.libelle ? taux : ''"
              ></v-select>
            </v-col>
            <v-col cols="3">
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
                :error="numeroCaseTvaError != ''"
                :error-messages="numeroCaseTvaError"
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
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="montant"
                v-model="montant"
                label="Montant"
                outlined
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
                @blur="montant = montant.toNumber().toComptaString()"
                @keydown.tab.prevent="cycleFocus"
              >
                <!-- <template v-slot:append>
                  <v-btn icon small :disabled="readonly" @click="calculMontant()" @keydown.enter.prevent.stop="calculMontant()">
                    <v-icon>mdi-calculator</v-icon>
                  </v-btn>
                </template> -->
              </v-text-field>
            </v-col>
            <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
          </v-row>
          <v-row dense>
            <v-col cols="12">
              <v-alert prominent type="warning" class="ma-0 pa-0 pl-5" v-if="warningMessage">
                <v-row align="center">
                  <v-col class="grow">{{ warningMessage }}</v-col>
                  <v-col class="shrink">
                    <v-btn class="ma-2" large icon @click="warningMessage = ''">
                      <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions v-if="ventilationIsSelected" class="text-center pt-0">
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                color="error"
                class="ma-2 pr-4"
                text
                tabindex="-1"
                v-if="!isNew && !readonly"
                @click="deleteVentilation()"
                v-on="on"
              >
                Supprimer
              </v-btn>
            </template>
            <span>Supprimer la ventilation<span class="shortcutTooltip">del</span></span>
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
                @click="sendVentilation"
                @keydown.tab.prevent="focusFirstElement"
                v-on="on"
                id="validateVentilation"
              >
                <v-icon left>mdi-check</v-icon> Valider
              </v-btn>
            </template>
            <span>Valider les modifications <span class="shortcutTooltip">alt + enter</span></span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import { TypeCompte, Devise, TypeMouvement, getTypesMouvements } from '@/models/AchatVente';
import SearchCaseTvaVue from '@/components/search/SearchCaseTva.vue';
import SearchEcheancierVue from '@/components/search/SearchEcheancier.vue';
import SearchDossierVue from '@/components/search/SearchDossier.vue';
import { CompteGeneralSearch, CompteGeneralSearchDTO } from '@/models/Compte/CompteGeneralSearch';
import { Ventilation, Journal, PieceAchatVente } from '@/models/Financier';
import { FinancierApi } from '@/api/FinancierApi';
import CaseTvaApi from '@/api/CaseTvaApi';
import { CaseTva } from '@/models/CaseTva';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import { EcheancierElement } from '@/models/Echeancier';
import { Reglement } from '@/models/Financier/Get/Reglement';
import DeviseApi from '@/api/DeviseApi';
import { DateTime } from '@/models/DateTime';
import { DossierSearch } from '@/models/Dossier/DossierSearch';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import AutoCompleteDossierVue from '@/components/autocomplete/AutocompleteDossier.vue';
import { ApplicationModule } from '@/store/modules/application';
import ParametreApi from '@/api/ParametresApi';
import { ParametreFinancier } from '@/models/ParametreFinancier';
import ExtraitVue from './Extrait.vue';
import CompteApi from '@/api/CompteApi';
import CompteGeneralSuggestion from './CompteGeneralSuggestion.vue';

@Component({
  components: {
    SearchCaseTvaVue,
    SearchEcheancierVue,
    SearchDossierVue,
    AutocompleteComptesVue,
    AutoCompleteDossierVue,
    CompteGeneralSuggestion,
  },
})
export default class VentilationVue extends Vue {
  @Ref() readonly compteComponent!: AutocompleteComptesVue;
  @Ref() readonly searchEcheancierDialog!: SearchEcheancierVue;
  @Ref() readonly caseTvaDialog!: SearchCaseTvaVue;
  @Ref() readonly dossierComponent!: AutoCompleteDossierVue;
  @Ref() readonly refTypesComptes!: HTMLElement;
  @Ref() readonly btnValidate!: HTMLElement;
  @Ref() readonly compteGeneralSuggestion!: CompteGeneralSuggestion;

  @PropSync('isReadOnly') public readonly!: boolean;
  @PropSync('Ventilations') public ventilations!: Ventilation[];
  @PropSync('DatePiece') public datePiece!: DateTime;
  @PropSync('VentileBase') public ventileBase!: number;
  @PropSync('VentileDevise') public ventileDevise!: number;
  @PropSync('Reglement') public reglement!: Reglement;

  get dossierIsEnabled() {
    return ApplicationModule.parametre.modeDossier;
  }

  private dialog = false;
  private ventilationIsSelected = false;

  private warningMessage = '';
  private deviseEntete!: Devise;
  private isNew = true;
  private errorMessage = '';
  private isValid = true;
  private resolve!: any;
  private reject!: any;
  private numeroJournal = 0;
  private numeroVentilation = 0;

  private typesComptes: TypeCompte[] = [];
  private typesComptesSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private compteLoading = false;
  private numeroCompte = '';
  private nomCompte = '';
  private nomCompteRules: any = [(v: string) => !!v || 'Nom obligatoire'];
  private numeroCompteRules: any = [(v: string) => !!v || 'Numéro obligatoire'];
  private natureCompte = '';

  private devises: Devise[] = [];
  private devisesSelected: Devise = new Devise();
  private devisesRules: any = [(v: string) => !!v || 'Devise obligatoire'];
  private taux = '';
  private libelle = '';
  private libelleRules: any = [(v: string) => !!v || 'Libellé obligatoire'];
  private typesMouvements: TypeMouvement[] = getTypesMouvements();
  private typesMouvementsSelected: TypeMouvement = new TypeMouvement();
  private typesMouvementsRules: any = [(v: string) => !!v || 'Type obligatoire'];
  private montant = '';
  private montantRules: any = [
    (v: string) => !!v || 'Montant obligatoire',
    (v: string) => v.isDecimal() || 'Montant invalide',
  ];
  private montantInit = 0;

  private caseTva: CaseTva = new CaseTva();
  private caseBases: number[] = [];
  private numeroCaseTva = '';
  private numeroCaseTvaError = '';
  private numeroCaseTvaRules: any = [(v: string) => !v || (v.isInt() && v.toNumber() != 0) || 'Numéro invalide'];

  private tauxCase = 0;
  private tvaLoading = false;

  private reference = '';
  private referenceJournal = '';
  private referencePiece = '';
  private referenceRules: any = [
    (v: string) => !v || (v.isInt() && v.length == 8) || v.length == 9 || 'Référence invalide',
  ];
  private referenceWarning = '';

  private idDossier = '';
  private nomDossier = '';
  private dossierIsDisabled = false;

  private tvaCalcule = 0;
  private tvaImpute = 0;

  private paramsFinanciers: ParametreFinancier[] = [];

  mounted() {
    FinancierApi.getTypesComptes().then((resp) => {
      this.typesComptes = resp;
    });
    ParametreApi.getParamsFinanciers().then((resp) => {
      this.paramsFinanciers = resp;
    });
  }

  //#region Open
  public open(ventilation: Ventilation, journal: Journal): Promise<Ventilation> {
    this.ventilationIsSelected = true;
    this.dialog = true;
    this.isNew = false;
    this.$nextTick(() => {
      (this.$refs.form as any)?.resetValidation();
      this.init(ventilation, journal);
      // this.compteComponent?.focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public async openNew(ventilation: Ventilation, journal: Journal): Promise<Ventilation> {
    this.ventilationIsSelected = true;
    this.dialog = true;
    this.isNew = true;
    this.$nextTick(() => {
      (this.$refs.form as any)?.resetValidation();
      this.init(ventilation, journal);
      // this.compteComponent?.focus();
      this.$nextTick(() => {
        const element = document.getElementById('validateVentilation');
        if (element != null) {
          element.scrollIntoView();
        }
      });
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private async init(ventilation: Ventilation, journal: Journal) {
    await this.initDevisesAsync(journal.devise, ventilation);
    this.compteComponent?.resetCompte();
    this.dossierComponent?.resetDossier();
    this.numeroJournal = journal.numero;
    this.numeroVentilation = ventilation.numeroVentilation;
    this.typesComptesSelected = this.typesComptes.find((tc) => tc.id == ventilation.typeCompte) || this.typesComptes[0];
    this.devisesSelected = this.devises.find((d) => d.id == ventilation.codeDevise) || this.devises[0];
    this.numeroCompte = ventilation.numeroCompte ? ventilation.numeroCompte.toString() : '';
    this.nomCompte = ventilation?.nomCompte ? ventilation.nomCompte : '';

    if (ventilation) {
      this.montantInit = ventilation.montantDevise;
      if (ventilation.numeroCompte) {
        this.compteComponent?.init(ventilation.numeroCompte.toString(), ventilation.nomCompte);

        if (ventilation.typeCompte == 'G') {
          const compteG = await CompteApi.getCompteGeneral('G', ventilation.numeroCompte);
          const caseTva = await CaseTvaApi.getCaseTVA(compteG.numeroCase, this.numeroJournal);
          ventilation.caseTva.numeroCase = caseTva.numeroCase;
          ventilation.caseTva = caseTva;
        }
      }

      if (ventilation.dossier) {
        this.dossierComponent.setDossier(
          new DossierSearch({
            idDossier: ventilation.dossier,
            nom: ventilation.dossierNom,
            dateEntree: '',
            dateSortie: '',
          })
        );
        this.idDossier = ventilation.dossier;
      }
    }

    this.idDossier = ventilation.dossier;
    this.nomDossier = ventilation.dossierNom;
    this.referenceJournal = ventilation?.referenceJournal ? ventilation.referenceJournal.toString() : '';
    this.referencePiece = ventilation?.referencePiece ? ventilation.referencePiece.toString() : '';
    this.reference = ventilation.libellePiece;

    this.libelle = ventilation?.libelle ? ventilation.libelle : '';
    this.typesMouvementsSelected =
      this.typesMouvements.find((d) => d.id == ventilation.codeMouvement) || this.typesMouvements[0];
    this.montant =
      ventilation.montantDevise && this.devisesSelected
        ? ventilation.montantDevise.toComptaString(this.devisesSelected.typeDevise == 'E' ? 0 : 2)
        : '';
    this.numeroCaseTva = ventilation.caseTva?.numeroCase ? ventilation.caseTva?.numeroCase.toString() : '';
    this.natureCompte = ventilation.natureCompte;

    if (this.caseTva) {
      this.caseTva.refresh(ventilation.caseTva);
    }
  }
  //#endregion
  private async resetCompte() {
    this.compteComponent?.resetCompte();
    if (this.typesComptesSelected.id != 'G') {
      this.caseTva.refresh();
      this.numeroCaseTva = '';
      this.montant = this.montantInit.toString();
    }
  }

  private async compteChange(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.nomCompte = '';
    } else if (
      typeof compte === 'string' &&
      (this.typesComptesSelected.id == 'C' || this.typesComptesSelected.id == 'F') &&
      compte.length == 8
    ) {
      this.loadPieceComptable(compte);
      this.dossierIsDisabled = true;
      this.natureCompte = '';
      this.dossierComponent?.resetDossier();
      //this.compteComponent.blur();
      this.$nextTick(() => this.selectTextMontant());
    } else if (compte instanceof CompteGeneralSearch) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      this.natureCompte = compte.nature;
      // await this.getCaseTvaVentilations(compte);
      this.setCompteGeneralCaseTvaAsync(compte);
      if (
        this.typesComptesSelected?.id == 'G' &&
        (compte.nature == 'R' || compte.nature == 'C') &&
        this.dossierIsEnabled
      ) {
        this.dossierIsDisabled = false;
        this.dossierComponent?.focus();
      } else {
        this.dossierIsDisabled = true;
        this.dossierComponent?.resetDossier();
        //this.compteComponent.blur();
        this.$nextTick(() => (this.$refs.numeroCaseTva as any).focus());
      }
    } else if (compte instanceof CompteSearch || compte instanceof CompteDeTier) {
      this.nomCompte = compte.nom;
      this.numeroCompte = compte.numero.toString();
      this.dossierIsDisabled = true;
      this.natureCompte = '';
      this.dossierComponent?.resetDossier();
      this.caseTva = new CaseTva();
      this.numeroCaseTva = '';
      //this.compteComponent.blur();
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

    this.$nextTick(() => this.selectTextMontant());
  }

  private async setCompteGeneralCaseTvaAsync(compte: CompteGeneralSearch) {
    let caseTva: CaseTva | null;
    caseTva = await this.getCaseTvaVentilations(compte); // On vérifie d'abord dans les ventilations

    if (!caseTva && compte.numeroCase) {
      // Si pas trouvé dans les ventilations, on prend le numéro défini par le compte
      caseTva = await CaseTvaApi.getCaseTVA(compte.numeroCase, this.numeroJournal);
    }

    if (caseTva) {
      this.caseTva = caseTva;
      this.numeroCaseTva = caseTva.numeroCase.toString();
    } else {
      this.caseTva = new CaseTva();
      this.numeroCaseTva = '';
    }
    this.calculMontant();
  }

  //* Init de la ventiliation depuis une piece comptable *//
  //#region Pièce comptable
  private loadPieceComptable(piece: string) {
    this.referenceJournal = '';
    this.referencePiece = '';

    if (piece && piece.length == 8) {
      const numeroJournal = piece.substring(0, 2);
      const numeroPiece = piece.substring(2, 8);

      FinancierApi.getPieceAchatVente(numeroJournal.toNumber(), numeroPiece.toNumber())
        .then((piece) => {
          if (piece) {
            this.initFromPieceComptable(piece);
            this.$nextTick(() => this.selectTextMontant());
          }
        })
        .catch();
    }
  }

  private initFromPieceComptable(piece: PieceAchatVente) {
    this.numeroCompte = piece.numeroCompteTiers?.toString();
    this.compteComponent?.init(piece.numeroCompteTiers, piece.nomCompteTiers);
    this.nomCompte = piece.nomCompteTiers;
    this.montant = Math.abs(piece.montantTotalDv).toComptaString();
    this.initDeviseFromPieceComptable(piece);
    this.reference = `${piece.numeroJournal}.${piece.numeroPiece}`;
    this.referenceJournal = piece.numeroJournal.toString();
    this.referencePiece = piece.numeroPiece.toString();
    this.typesMouvementsSelected =
      this.typesComptesSelected.id == 'F' ? this.typesMouvements[0] : this.typesMouvements[1];
    this.natureCompte = '';
  }

  private initDeviseFromPieceComptable(piece: PieceAchatVente) {
    if (piece.montantAVentilerDv != 0)
      this.devisesSelected = this.devises.find((e) => e.id == piece.codeDevise) || this.devises[0];
    else if (piece.montantAVentilerBase != 0) this.devisesSelected = this.devises[0];
  }
  //#endregion

  //#region Devise
  private async initDevisesAsync(deviseJournal: Devise, ventilation?: Ventilation) {
    this.devises = [];
    this.deviseEntete = deviseJournal;
    this.devises.push(new Devise({ id: 1, libelle: 'EUR', typeDevise: 'D' }));
    if (deviseJournal && !this.devises.find((d) => d.id == deviseJournal.id)) this.devises.push(deviseJournal);
    if (ventilation && ventilation.codeDevise != 0) {
      if (!this.devises.find((d) => d.id == ventilation.codeDevise)) {
        this.devises.push(
          new Devise({
            id: ventilation.codeDevise,
            libelle: ventilation.libelleDevise,
            typeDevise: this.devisesSelected.typeDevise,
          })
        );
        this.devisesSelected = this.devises.find((d) => d.id == ventilation.codeDevise) || this.devises[0];
      } else this.devisesSelected = this.devises[0];
    }

    await this.initTauxDeviseAsync(this.devisesSelected.id, this.datePiece);
  }

  private async initTauxDeviseAsync(numeroDevise: number, datePiece: DateTime) {
    try {
      if (!numeroDevise || numeroDevise == 1) this.taux = '1,000000';
      else if (datePiece.isValid() && numeroDevise) {
        const taux = await DeviseApi.getTaux(numeroDevise, datePiece);
        this.taux = taux.toDecimalString(6);
      }
    } catch {
      this.taux = '1,000000';
    }
  }
  //#endregion

  //* Init de la ventiliation depuis L'échéancier *//
  //#region Echeancier
  private openSearchEcheancier(): void {
    if ((this.typesComptesSelected.id == 'C' || this.typesComptesSelected.id == 'F') && this.numeroCompte) {
      (this.$refs.searchEcheancierDialog as SearchEcheancierVue)
        .open(this.typesComptesSelected.id, this.numeroCompte, `${this.numeroCompte} - ${this.nomCompte}`)
        .then((elements) => {
          this.initFromEcheancier(elements);
          this.$nextTick(() => {
            if (this.montant.toNumber() == this.ventileDevise) {
              this.sendVentilation();
            } else {
              this.selectTextMontant();
            }
          });
        })
        .catch(() => {
          this.$nextTick(() => (this.$refs.reference as any)?.focus());
        });
    }
  }

  private initFromEcheancier(elements: EcheancierElement[]) {
    // Init ventilation for the first element
    const element = elements[0];
    this.devisesSelected = this.devises.find((e) => e.id == element.codeDevise) || this.devises[0];
    this.reference = `${element.numeroJournal}.${element.numeroPiece}`;
    this.referenceJournal = element.numeroJournal.toString();
    this.referencePiece = element.numeroPiece.toString();
    this.caseBases.push(element.caseBase1, element.caseBase2, element.caseBase3);
    // Take the opposite codeMouvement from element
    this.typesMouvementsSelected = element.soldeDevise > 0 ? this.typesMouvements[1] : this.typesMouvements[0]; // [0] == DB, [1] == CR
    this.montant = Math.abs(element.soldeDevise).toComptaString(2);
    // Init other ventilations if there were more than one element
    for (let index = 1; index < elements.length; index++) {
      this.createVentilationFromEcheancier(elements[index]);
    }
  }

  private createVentilationFromEcheancier(element: EcheancierElement) {
    const ventilation = new Ventilation();
    const maxLigne = this.ventilations?.length ? Math.max(...this.ventilations.map((i) => i.numeroVentilation)) : 0;
    ventilation.numeroVentilation = maxLigne + 1;
    ventilation.typeCompte = this.typesComptesSelected.id;
    ventilation.numeroCompte = this.numeroCompte.toNumber();
    ventilation.nomCompte = this.nomCompte;
    ventilation.referenceJournal = element.numeroJournal;
    ventilation.referencePiece = element.numeroPiece;
    ventilation.libelle = this.reglement.libelle;
    ventilation.caseBases.push(element.caseBase1, element.caseBase2, element.caseBase3);
    ventilation.codeMouvement = element.montantDevise < 0 ? 'DB' : 'CR';
    ventilation.montantDevise = Math.abs(element.montantDevise);
    ventilation.montantBase = Math.abs(element.montantBase);
    ventilation.codeDevise = element.codeDevise;
    ventilation.libelleDevise = element.libelleDevise;
    this.ventilations.push(ventilation);
  }
  //#endregion

  private async loadCaseTvaAsync() {
    try {
      if (this.readonly) return;
      this.tvaLoading = true;
      if (this.numeroCaseTva?.isInt() && this.numeroCaseTva) {
        this.tvaLoading = true;
        this.errorMessage = '';
        const caseTva = await CaseTvaApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal);
        if (caseTva) {
          this.numeroCaseTva = caseTva.numeroCase.toString();
          this.caseTva = caseTva;
          this.numeroCaseTvaError = '';
          this.calculMontant();
        }
      } else {
        this.caseTva.refresh();
        this.caseTva = new CaseTva();
      }
    } catch (err) {
      this.caseTva = new CaseTva();
      this.numeroCaseTvaError = 'Numéro invalide';
      if (err.request.status != 505) this.errorMessage = err.request.response;
    } finally {
      this.tvaLoading = false;
    }
  }

  private openSearchCaseTva(): void {
    (this.$refs.caseTvaDialog as SearchCaseTvaVue)
      .open(this.numeroJournal)
      .then((caseTva) => {
        this.numeroCaseTva = caseTva.numeroCase.toString();
        this.caseTva = caseTva;
        this.numeroCaseTvaError = '';
        this.calculMontant();
        this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
      })
      .catch(() => {
        this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus());
      });
  }

  private getModel(): Ventilation {
    const ventilation = new Ventilation();
    ventilation.numeroVentilation = this.numeroVentilation;
    ventilation.typeCompte = this.typesComptesSelected ? this.typesComptesSelected.id : '';
    ventilation.numeroCompte = +this.numeroCompte;
    ventilation.nomCompte = this.nomCompte;
    ventilation.libelle = this.libelle;
    ventilation.codeMouvement = this.typesMouvementsSelected ? this.typesMouvementsSelected.id : '';
    ventilation.montantDevise = this.montant.toNumber();
    ventilation.montantBase = this.montant.toNumber() * this.taux.toNumber();
    ventilation.codeDevise = this.devisesSelected ? this.devisesSelected.id : 0;
    ventilation.libelleDevise = this.devisesSelected ? this.devisesSelected.libelle : '';
    ventilation.codeCaseTVA = this.caseTva.numeroCase;
    ventilation.libelleCaseTVA = this.caseTva.libelleCase;
    ventilation.referenceJournal = this.referenceJournal.toNumber();
    ventilation.referencePiece = this.referencePiece.toNumber();
    ventilation.dossier = this.idDossier;
    ventilation.dossierNom = this.nomDossier;
    ventilation.caseTva = new CaseTva(this.caseTva);
    ventilation.caseBases = this.caseBases;
    return ventilation;
  }

  private sendVentilation() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.ventilationIsSelected = false;
        this.resolve(this.getModel());
      }
    });
  }

  // @Watch("caseTva")
  // private caseTvaChanged(val: string, oldVal: string){
  //   if(!this.readonly && !this.montant) this.calculMontant();
  // }

  @Watch('devisesSelected')
  private deviseChanged(val: Devise) {
    if (this.readonly) return;
    //if(!this.montant) this.calculMontant();
    if (val) this.initTauxDeviseAsync(val.id, this.datePiece);
    else this.taux = '1,000000';
  }

  private deleteVentilation() {
    this.ventilationIsSelected = false;
    this.resolve();
  }

  private focusFirstElement() {
    this.refTypesComptes.focus();
  }

  private cycleFocus() {
    if (!this.isValid) this.focusFirstElement();
    else (this.$refs.btnValidate as any)?.$el?.focus();
  }

  public close() {
    this.numeroCaseTvaError = '';
    if (this.ventilationIsSelected) {
      this.ventilationIsSelected = false;
      if (this.reject) this.reject();
    }
  }

  private changeType(event: KeyboardEvent) {
    if (['c', 'f', 'g', 'z'].includes(event.key)) {
      if ('z' == event.key) this.typesComptesSelected = new TypeCompte({ id: 'Z', libelle: 'Extra-comptable' });
      this.$nextTick(() => this.refTypesComptes.blur());
      this.$nextTick(() => this.compteComponent.focus());
    }
  }

  public async getCaseTvaVentilations(compte: CompteGeneralSearch): Promise<CaseTva | null> {
    let caseTva = new CaseTva();
    let caseBase = 0;
    const caseBases: number[] = [];
    // Retrouver les cases bases dans les ventilations hors TVA
    this.ventilations
      .filter((v) => v.caseTva.typeCase != 50)
      .forEach((v) => {
        v.caseBases.forEach((cb) => caseBases.push(cb));
      });
    // Filter duplicates or zeros
    caseBases.filter((item, index) => caseBases.indexOf(item) != index || item != 0);

    // On cherche les cases déjà utilisées pour ce compte
    const usedCaseBases = this.ventilations
      .filter(
        (v) =>
          v.typeCompte == 'G' && v.numeroCompte == compte.numero && v.caseTva.typeCase != 0 && v.caseTva.typeCase != 50
      )
      .map((v) => v.codeCaseTVA);
    //Filter duplicates and zeros
    usedCaseBases.filter((item, index) => usedCaseBases.indexOf(item) != index || item != 0);

    // On renvoie la première case qui n'est pas reprise dans les cases déjà utilisées
    caseBase = caseBases.find((c) => !usedCaseBases.some((uc) => c == uc)) ?? 0;

    if (caseBase != 0) {
      // Si caseTVA, on récupère les infos et on les renvoie
      caseTva = await CaseTvaApi.getCaseTVA(caseBase, this.numeroJournal);
      return caseTva;
    } else {
      // Sinon on renvoie null pour que setGeneralCompteTva prenne le relais
      return null;
    }
  }

  public selectTextMontant() {
    this.$nextTick(() => (this.$refs.montant as Vue).$el.querySelector('input')?.select());
  }

  public calculMontant() {
    if (this.caseTva.typeCase == 1)
      this.montant = (Math.abs(this.montantInit) / (1 + this.caseTva.tauxTvaCase / 100)).toString();
    this.montant = this.montant.toNumber().toComptaString();
  }

  public openSuggestion() {
    this.compteGeneralSuggestion
      .open()
      .then(async (compte) => {
        this.compteComponent.init(compte.numeroCompte.toString(), compte.libelle);
        const compteG = await CompteApi.getCompteGeneral('G', compte.numeroCompte);
        this.compteChange(compteG);
      })
      .catch((_) => {
        this.compteComponent.focus();
      });
  }
}
</script>

<style lang="scss" scoped>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
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

#editVentilation {
  z-index: 999;
}
</style>
