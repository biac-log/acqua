<template>
  <!-- <v-dialog v-model="dialog" width="800" @click:outside="close()" @keydown.esc="close()" @keydown.alt.enter="sendContrepartie()"> -->
  <div class="ma-0 pa-0 editContainer" @keydown.esc.stop="close()" @keydown.alt.enter.stop="sendContrepartie()">
    <div :class="dialog ? 'overlay' : ''" @click="close()" />
    <!-- <transition name="fade" leave-absolute> -->
    <v-form v-if="dialog" ref="form" v-model="isValid" lazy-validation autocomplete="off">
      <span tabindex="1" @focus="focusLastElement" />
      <v-card id="editContrepartie">
        <v-card-text class="mb-0 pb-0">
          <v-row dense>
            <v-col cols="2">
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
                @change="resetCompte"
                tabindex="2"
                autofocus
              ></v-select>
            </v-col>
            <v-col cols="3">
              <autocomplete-comptes-vue
                ref="refNumeroCompte"
                label="N° compte"
                @change="numeroCompteChange"
                :hide-details="readonly"
                :filled="readonly"
                :readonly="readonly"
                :rules="numeroCompteRules"
                :tabindex="3"
                :typeCompte="typesComptesSelected.id"
              />
            </v-col>
            <SearchCompteContrepartieVue ref="compteDialog"></SearchCompteContrepartieVue>
            <v-col cols="3">
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
            <v-col>
              <v-text-field
                ref="libelle"
                label="Libelle"
                v-model="libelle"
                counter
                maxlength="23"
                :filled="readonly"
                :readonly="readonly"
                :rules="libelleRules"
                :hide-details="readonly"
                tabindex="5"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">
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
                tabindex="-1"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-text-field
                label="Numéro case TVA"
                ref="numeroCaseTva"
                v-model="numeroCaseTva"
                :filled="readonly"
                :readonly="readonly"
                :rules="numeroCaseTvaRules"
                :hide-details="readonly"
                :loading="tvaLoading"
                @keypress.enter="loadCaseTva"
                @change="loadCaseTva"
                @keydown.ctrl.f.prevent="OpenSearchCaseTva()"
                @keydown.f5.prevent="OpenSearchCaseTva()"
                tabindex="6"
              >
                <template v-slot:append>
                  <v-tooltip top open-delay="500" open-on-hover>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        small
                        :disabled="readonly"
                        @click="OpenSearchCaseTva()"
                        v-on="on"
                        @keydown.enter.prevent.stop="OpenSearchCaseTva()"
                        tabindex="-1"
                      >
                        <v-icon>mdi-magnify</v-icon>
                      </v-btn>
                    </template>
                    <span>Rechercher une case TVA <span class="shortcutTooltip">CTRL+F</span></span>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field
                label="Libellé case TVA"
                v-model="caseTva.libelleCase"
                :filled="readonly"
                :hide-details="readonly"
                tabindex="-1"
                readonly
              ></v-text-field>
              <SearchCaseTvaVue ref="caseTvaDialog"></SearchCaseTvaVue>
            </v-col>
            <v-col cols="3">
              <v-select
                class="ml-10"
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
                tabindex="-1"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="montantComponent"
                v-model="montant"
                label="Montant"
                :filled="readonly"
                :readonly="readonly"
                :rules="montantRules"
                :hide-details="readonly"
                @blur="montant = montant.toNumber().toDecimalString()"
                tabindex="8"
              >
                <template v-slot:append>
                  <v-btn
                    icon
                    small
                    :disabled="readonly"
                    @click="calculMontant()"
                    @keydown.enter.prevent.stop="calculMontant()"
                    tabindex="-1"
                  >
                    <v-icon>mdi-calculator</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row dense v-if="typesComptesSelected.id == 'G' && dossierIsEnabled">
            <v-col cols="2">
              <AutoCompleteDossierVue
                ref="dossierComponent"
                :readonly.sync="readonly"
                :required="false"
                @Change="dossierChange"
              >
              </AutoCompleteDossierVue>
            </v-col>
            <v-col cols="4">
              <v-text-field
                label="Nom Dossier"
                v-model="nomDossier"
                :filled="readonly"
                :hide-details="readonly"
                tabindex="-1"
                readonly
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row dense v-if="warningMessage">
            <v-alert prominent type="warning" class="ma-0 pa-0 pl-5">
              <v-row align="center">
                <v-col class="grow">{{ warningMessage }}</v-col>
                <v-col class="shrink">
                  <v-btn class="ma-2" large icon @click="warningMessage = ''">
                    <v-icon>mdi-close-circle</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-alert>
          </v-row>
        </v-card-text>
        <v-card-actions class="text-center ma-0 pt-0">
          <v-btn
            color="error"
            class="ma-2 pr-4"
            text
            tabindex="-1"
            v-if="!isNew && !readonly"
            @click="deleteContrepartie()"
          >
            Supprimer</v-btn
          >
          <v-spacer></v-spacer>
          <v-menu bottom left v-if="!readonly">
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="generateTVA">
                <v-list-item-title>Calculer la TVA</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn color="blue darken-1" class="ma-2 pr-4" tile outlined @click="close()" tabindex="-1">
            <v-icon left>mdi-close</v-icon> Fermer</v-btn
          >
          <v-tooltip top open-delay="500" open-on-hover>
            <template v-slot:activator="{ on }">
              <v-btn
                ref="btnValidate"
                class="ma-2 pr-4"
                tile
                color="success"
                v-if="!readonly"
                :disabled="!isValid"
                @click="sendContrepartie"
                v-on="on"
                tabindex="9"
              >
                <v-icon left>mdi-check</v-icon> Valider
              </v-btn>
            </template>
            <span>Valider la contrepartie <span class="shortcutTooltip">alt + enter</span></span>
          </v-tooltip>
          <span tabindex="10" @focus="focusFirstElement" />
        </v-card-actions>
      </v-card>
    </v-form>
    <!-- </transition> -->
    <!-- </v-dialog> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import { PieceComptableContrepartie, TypeCompte, TypeMouvement, getTypesMouvements } from '@/models/AchatVente';
import AchatVenteApi from '@/api/AchatVenteApi';
import CompteApi from '@/api/CompteApi';
import SearchCompteContrepartieVue from './SearchCompteContrepartie.vue';
import SearchCaseTvaVue from '@/components/search/SearchCaseTva.vue';
import { CompteGeneralSearch } from '../../../models/Compte/CompteGeneralSearch';
import { Devise } from '@/models/Devise/Devise';
import GridContrepartiesVue from './GridContreparties.vue';
import CaseTvaApi from '../../../api/CaseTvaApi';
import { CaseTva } from '@/models/CaseTva';
import { DossierSearch } from '@/models/Dossier/DossierSearch';
import AutoCompleteDossierVue from '@/components/autocomplete/AutocompleteDossier.vue';
import { DateTime } from '@/models/DateTime';
import { AxiosError } from 'axios';
import { ApplicationModule } from '@/store/modules/application';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';

@Component({
  name: 'EditContrepartie',
  components: {
    SearchCompteContrepartieVue,
    SearchCaseTvaVue,
    AutoCompleteDossierVue,
    AutocompleteComptesVue
  }
})
export default class extends Vue {
  @Ref() readonly dossierComponent!: AutoCompleteDossierVue;
  @Ref() readonly refNumeroCompte!: AutocompleteComptesVue;
  @Ref() readonly montantComponent!: HTMLInputElement;

  @PropSync('isReadOnly') public readonly!: boolean;
  @PropSync('DatePiece') private datePiece!: DateTime;
  @PropSync('TauxDevise') private tauxDevise!: string;

  get dossierIsEnabled() {
    return ApplicationModule.parametre.modeDossier;
  }

  private dialog = false;
  private isNew = true;
  private errorMessage = '';
  private isValid = true;
  private resolve!: any;
  private reject!: any;
  private numeroJournal = 0;

  private typesComptes: TypeCompte[] = [];
  private typesComptesSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];
  private compteLoading = false;
  private numeroCompte = '';
  private numeroCompteRules: any = [(v: string) => !!v || 'Numéro obligatoire'];
  private numeroCompteSelected: {
    numero: string | number;
    numeroNom: string;
  } = { numero: '', numeroNom: '' };
  private nomCompte = '';
  private nomCompteRules: any = [(v: string) => !!v || 'Nom obligatoire'];
  private devises: Devise[] = [];
  private devisesSelected: Devise = new Devise();
  private devisesRules: any = [(v: string) => !!v || 'Devise obligatoire'];
  private libelle = '';
  private libelleRules: any = [(v: string) => !!v || 'Libelle obligatoire'];
  private typesMouvements: TypeMouvement[] = getTypesMouvements();
  private typesMouvementsSelected: TypeMouvement = new TypeMouvement();
  private typesMouvementsRules: any = [(v: string) => !!v || 'Type obligatoire'];
  private montant = '';
  private montantRules: any = [(v: string) => !!v || 'Montant obligatoire'];
  private numeroCaseTva = '';
  private numeroCaseTvaRules: any = [
    (v: string) => !!v || 'Case tva obligatoire',
    (v: string) => (v.isInt() && v.toNumber() != 0) || 'Numero invalide'
  ];
  private caseTva: CaseTva = new CaseTva();

  private libelleCaseTva = '';
  private tauxCase = 0;
  private tvaLoading = false;
  private reference = '';
  private referenceRules: any = [(v: string) => !!v || 'Référence obligatoire'];
  private warningMessage = '';

  private tvaCalcule = 0;
  private tvaImpute = 0;
  private ventileDevise = 0;

  mounted() {
    AchatVenteApi.getTypesComptes().then((resp) => {
      this.typesComptes = resp;
    });
  }

  public open(
    contrepartie: PieceComptableContrepartie,
    numeroJournal: number,
    deviseEntete: Devise,
    ventileDevise: number,
    tvaCalcule: number,
    tvaImpute: number
  ): Promise<PieceComptableContrepartie> {
    this.dialog = true;
    this.isNew = false;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(contrepartie, numeroJournal, deviseEntete, ventileDevise, tvaCalcule, tvaImpute, '');
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  public openNew(
    numeroJournal: number,
    deviseEntete: Devise,
    ventileDevise: number,
    tvaCalcule: number,
    tvaImpute: number,
    propositionLibelle: string,
    contrepartie?: PieceComptableContrepartie
  ): Promise<PieceComptableContrepartie> {
    this.dialog = true;
    this.isNew = true;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.init(
        contrepartie || new PieceComptableContrepartie(),
        numeroJournal,
        deviseEntete,
        ventileDevise,
        tvaCalcule,
        tvaImpute,
        propositionLibelle
      );
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private init(
    contrepartie: PieceComptableContrepartie,
    numeroJournal: number,
    deviseEntete: Devise,
    ventileDevise: number,
    tvaCalcule: number,
    tvaImpute: number,
    propositionLibelle: string
  ) {
    this.dossierComponent?.resetDossier();
    this.initDevises(deviseEntete, contrepartie);
    this.numeroJournal = numeroJournal;
    this.typesComptesSelected =
      this.typesComptes.find((tc) => tc.id == contrepartie.typeCompte) || this.typesComptes[0];
    this.devisesSelected = this.devises.find((d) => d.id == contrepartie.codeDevise) || deviseEntete;

    if (contrepartie) {
      this.refNumeroCompte.init(contrepartie.numeroCompte.toString(), contrepartie.compteLibelle);

      if (contrepartie.dossier) {
        this.dossierComponent.setDossier(
          new DossierSearch({
            idDossier: contrepartie.dossier,
            nom: contrepartie.dossierNom,
            dateEntree: '',
            dateSortie: ''
          })
        );
        this.idDossier = contrepartie.dossier;
      }
    }

    this.numeroCompte = contrepartie.numeroCompte ? contrepartie.numeroCompte.toString() : '';
    this.nomCompte = contrepartie.compteLibelle;
    this.libelle = contrepartie.libelle ? contrepartie.libelle : propositionLibelle;
    this.typesMouvementsSelected =
      this.typesMouvements.find((d) => d.id == contrepartie.codeMouvement) || this.typesMouvements[0];
    if (contrepartie.montantDevise == 0)
      this.montant =
        contrepartie.montantBase && this.devisesSelected
          ? contrepartie.montantBase.toDecimalString(this.devisesSelected.typeDevise == 'E' ? 0 : 2)
          : '';
    else
      this.montant =
        contrepartie.montantDevise && this.devisesSelected
          ? contrepartie.montantDevise.toDecimalString(this.devisesSelected.typeDevise == 'E' ? 0 : 2)
          : '';
    this.numeroCaseTva = contrepartie.caseTva.numeroCase ? contrepartie.caseTva.numeroCase.toString() : '';
    this.caseTva.refresh(contrepartie.caseTva);
    this.libelleCaseTva = contrepartie.caseTva.libelleCase;

    this.ventileDevise = ventileDevise;
    this.tvaCalcule = tvaCalcule;
    this.tvaImpute = tvaImpute;
  }

  private initDevises(deviseEntete: Devise, contrepartie?: PieceComptableContrepartie) {
    this.devises = [];
    this.devises.push(new Devise({ id: 1, libelle: 'EUR', typeDevise: 'D' }));
    if (deviseEntete && !this.devises.find((d) => d.id == deviseEntete.id)) this.devises.push(deviseEntete);
    if (contrepartie && contrepartie.codeDevise != 0) {
      if (!this.devises.find((d) => d.id == contrepartie.codeDevise)) {
        this.devises.push(
          new Devise({
            id: contrepartie.codeDevise,
            libelle: contrepartie.libelleDevise,
            typeDevise: this.devisesSelected.typeDevise
          })
        );
      }
    }
  }

  private resetCompte() {
    this.refNumeroCompte?.resetCompte();
  }

  private numeroCompteChange(value: string | CompteGeneralSearch) {
    if (!value) {
      this.numeroCompte = '';
      this.nomCompte = '';
    }
    if (typeof value === 'string') {
      this.numeroCompte = value;
      this.loadCompte();
    } else if (value instanceof CompteGeneralSearch) {
      this.numeroCompte = value.numero.toString();
      this.$nextTick(() => (this.$refs.numeroCompte as any)?.blur());
      this.$nextTick(() => (this.$refs.libelle as any)?.focus());
      this.loadCompte();
    } else {
      this.numeroCompte = '';
      this.nomCompte = '';
    }
  }

  private loadCompte() {
    if (this.typesComptesSelected && this.numeroCompte) {
      this.compteLoading = true;
      CompteApi.getCompteGeneral(this.typesComptesSelected.id, this.numeroCompte.toString())
        .then((compte) => {
          this.setCompte(compte);
        })
        .finally(() => {
          this.compteLoading = false;
        });
    }
  }

  private setCompte(compte: CompteGeneralSearch) {
    this.numeroCompte = compte.numero.toString();
    this.nomCompte = compte.nom;
    if (compte.numeroCase) {
      CaseTvaApi.getCaseTVA(compte.numeroCase, this.numeroJournal).then((resp) => {
        if (resp) {
          this.caseTva = resp;
          this.numeroCaseTva = compte.numeroCase.toString();
        } else this.caseTva = new CaseTva();
        this.calculMontant();
      });
    }
  }

  private calculMontant() {
    if (this.caseTva.typeCase == 50)
      this.montant = this.calculMontantTva().toDecimalString(this.devisesSelected.typeDevise == 'E' ? 0 : 2);
    else if (this.caseTva.typeCase == 1)
      this.montant = this.calculMontantTaxable().toDecimalString(this.devisesSelected.typeDevise == 'E' ? 0 : 2);
  }
  private calculMontantTva(): number {
    let montantTva = this.tvaCalcule - this.tvaImpute;
    if (this.typesMouvementsSelected.id == 'DB') montantTva = this.tvaImpute - this.tvaCalcule;
    if (montantTva < 0) montantTva = 0;
    return montantTva;
  }

  private calculMontantTaxable(): number {
    let montantTaxable = this.tvaCalcule - this.tvaImpute;
    if (this.typesMouvementsSelected.id == 'CR') montantTaxable = this.ventileDevise - montantTaxable;
    else montantTaxable = montantTaxable - this.ventileDevise;

    if (montantTaxable < 0) montantTaxable = 0;
    else if (this.caseTva.tauxTvaCase) montantTaxable = montantTaxable / (1 + this.caseTva.tauxTvaCase / 100);

    return montantTaxable;
  }

  private loadCaseTva() {
    if (this.readonly) return;

    if (this.numeroCaseTva) {
      this.tvaLoading = true;
      this.errorMessage = '';
      CaseTvaApi.getCaseTVA(this.numeroCaseTva, this.numeroJournal)
        .then((caseTva) => {
          this.numeroCaseTva = caseTva.numeroCase.toString();
          this.caseTva = caseTva;
          this.calculMontant();
        })
        .catch((err: AxiosError) => {
          this.numeroCaseTva = '';
          this.caseTva = new CaseTva();
          if (err.request.status != 505) this.errorMessage = err.request.response;
        })
        .finally(() => {
          this.tvaLoading = false;
        });
    } else {
      this.caseTva.refresh();
      this.caseTva = new CaseTva();
    }
  }

  private OpenSearchCaseTva(): void {
    (this.$refs.caseTvaDialog as SearchCaseTvaVue)
      .open(this.numeroJournal)
      .then((caseTva) => {
        this.numeroCaseTva = caseTva.numeroCase.toString();
        this.caseTva = new CaseTva(caseTva);
        this.calculMontant();
        this.$nextTick(() => this.montantComponent?.focus());
      })
      .catch(() => {
        this.$nextTick(() => (this.$refs.numeroCaseTva as any)?.focus());
      });
  }

  private getModel(): PieceComptableContrepartie {
    const contrepartie = new PieceComptableContrepartie();
    contrepartie.typeCompte = this.typesComptesSelected ? this.typesComptesSelected.id : '';
    contrepartie.numeroCompte = +this.numeroCompte;
    contrepartie.compteLibelle = this.nomCompte;
    contrepartie.libelle = this.libelle;
    contrepartie.codeMouvement = this.typesMouvementsSelected ? this.typesMouvementsSelected.id : '';
    contrepartie.montantDevise = this.montant.toNumber();
    contrepartie.montantBase = this.montant.toNumber();
    contrepartie.codeDevise = this.devisesSelected ? this.devisesSelected.id : 0;
    contrepartie.devise = this.devisesSelected;
    contrepartie.caseTva = new CaseTva(this.caseTva);
    contrepartie.dossier = this.idDossier;
    return contrepartie;
  }

  private sendContrepartie() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.dialog = false;
        this.resolve(this.getModel());
      }
    });
  }

  private idDossier = '';
  private nomDossier = '';
  private dossierChange(dossier: DossierSearch) {
    this.idDossier = dossier.idDossier;
    this.nomDossier = dossier.nom;
    if (this.datePiece && dossier.idDossier && !dossier.dossierIsActif(this.datePiece))
      this.warningMessage = `Attention, le dossier n'est pas actif à la date du ${this.datePiece.toString()}`;
    else this.warningMessage = '';

    this.$nextTick(() => this.montantComponent?.focus());
  }

  @Watch('caseTva')
  private caseTvaChanged() {
    if (!this.readonly && !this.montant) this.calculMontant();
  }

  @Watch('devisesSelected')
  private deviseChanged() {
    if (!this.readonly && !this.montant) this.calculMontant();
  }

  private modifier() {
    this.readonly = false;
    this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
  }

  private deleteContrepartie() {
    this.dialog = false;
    this.resolve();
  }

  private async generateTVA() {
    const parent = this.$parent as GridContrepartiesVue;
    this.init(
      await parent.getContrepartieTVA(),
      parent.journal.numero,
      parent.devise,
      parent.getVentileDevise(),
      parent.getTvaCalcule(),
      parent.getTvaImpute(),
      parent.propositionLibelle
    );
    this.montant = Math.abs(parent.getVentileDevise()).toDecimalString(2);
  }

  private focusFirstElement() {
    this.$nextTick(() => (this.$refs.numeroCompte as any)?.focus());
  }

  private focusLastElement() {
    this.$nextTick(() => (this.$refs.btnValidate as any)?.$el?.focus());
  }

  private close() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style scopped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
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
  transition: background-color 0.2s;
}

#editContrepartie {
  z-index: 999;
}

.editContainer {
  height: 245px;
}
</style>
