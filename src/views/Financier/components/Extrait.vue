<template>
  <v-dialog
    v-model="dialog"
    @keydown.alt.enter.stop="sendExtrait"
    @click:outside="close()"
    @keydown.esc.stop="close()"
    @keydown.f2.stop="modifierPiece()"
    @keydown.107.prevent.stop="createVentilation"
  >
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card min-height="710px">
        <v-toolbar color="primary" dark flat>
          <v-card-title class="pa-2">
            <span v-if="numeroExtrait">Extrait {{ journal.numero }}.{{ numeroPiece }} - Ligne {{ numeroExtrait }}</span>
            <span v-else>Nouvelle ligne - Pièce {{ journal.numero }}.{{ journal.numeroDernierePiece + 1 }}</span>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-tooltip v-if="readonly" top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-5" color="success" @click="modifierPiece" v-on="on">
                <v-icon left>mdi-pencil</v-icon>Modifier
              </v-btn>
            </template>
            <span>Modifier<span class="shortcutTooltip">F2</span></span>
          </v-tooltip>
          <v-btn icon @click="close()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-title class="pa-0 ma-0">
          <v-row>
            <v-col cols="12" v-if="errorMessage">
              <v-alert dense outlined type="error" class="ma-0">
                {{ errorMessage }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col lg="7" sm="12">
              <v-row>
                <v-col cols="4">
                  <v-text-field
                    label="Date pièce"
                    v-model="datePiece"
                    outlined
                    readonly
                    tabindex="-1"
                    prepend-inner-icon="mdi-calendar"
                    hide-details
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Solde initial"
                    v-model="soldeInitial"
                    outlined
                    readonly
                    tabindex="-1"
                    hide-details
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    label="Solde actuel"
                    v-model="soldeActuel"
                    outlined
                    readonly
                    tabindex="-1"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field v-model="libelleCompte" label="Compte" outlined readonly tabindex="-1" hide-details />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    ref="montant"
                    label="Montant"
                    v-model="montant"
                    outlined
                    :readonly="readonly"
                    :suffix="journal.devise.libelle"
                    @blur="montant = montant.toNumber().toComptaString()"
                    :rules="montantRules"
                    autofocus
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-select
                    :items="reglements"
                    v-model="reglementSelected"
                    label="Règlement"
                    item-text="libelle"
                    item-value="numero"
                    return-object
                    outlined
                    :readonly="readonly"
                    :hide-details="readonly"
                    :rules="reglementsRules"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pt-0">
                  <v-card outlined>
                    <v-toolbar color="#EEEEEE" flat dense>
                      <h2>Ventilations</h2>
                      <v-tooltip top open-delay="500">
                        <template v-slot:activator="{ on }">
                          <v-btn
                            color="primary"
                            fab
                            x-small
                            class="ml-5"
                            ref="btnAdd"
                            v-on="on"
                            :disabled="!createVentilationEnabled"
                            @click.stop="createVentilation"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                        </template>
                        <span>Ajouter une ventilation <span class="shortcutTooltip"> + </span></span>
                      </v-tooltip>
                      <v-spacer></v-spacer>
                      <v-card-title :class="!ventileBase || ventileBase == 0 ? 'equilibre' : 'notEquilibre'">
                        <span v-if="!journal.devise || journal.devise.id == 1"
                          >Montant à ventiler :
                          <b
                            >{{ ventileDevise | numberToStringEvenZero }}
                            {{ journal.devise ? journal.devise.libelle : 'EUR' }}</b
                          ></span
                        >
                        <span v-if="journal.devise && journal.devise.id != 1">
                          Ventiler devise :
                          <b>
                            {{ ventileDevise | numberToStringEvenZero }}
                            {{ journal.devise ? journal.devise.libelle : 'EUR' }}
                          </b>
                          - Ventiler base : <b>{{ ventileBase | numberToStringEvenZero }} EUR</b>
                        </span>
                      </v-card-title>
                    </v-toolbar>
                    <v-data-table
                      :headers="headersVentilation"
                      :items="ventilations"
                      id="dataTable"
                      class="elevation-1"
                      disable-pagination
                      hide-default-footer
                      @click:row="editVentilation"
                      disable-sort
                      dense
                      :height="dataTableHeight"
                    >
                    </v-data-table>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
            <v-col lg="5" md="12">
              <VentilationVue
                ref="refVentilationVue"
                :Ventilations.sync="ventilations"
                :isReadOnly.sync="readonly"
                :DatePiece.sync="datePiece"
                :Reglement.sync="reglementSelected"
                :VentileBase.sync="ventileBase"
                :VentileDevise.sync="ventileDevise"
              ></VentilationVue>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="text-center" v-if="!readonly">
          <v-tooltip top open-delay="500" v-if="numeroExtrait && !readonly">
            <template v-slot:activator="{ on }">
              <v-btn color="error" class="ma-2 pr-4" text tabindex="-1" @click="deleteExtrait()" v-on="on">
                Supprimer
              </v-btn>
            </template>
            <span>Supprimer l'extrait<span class="shortcutTooltip">del</span></span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-tooltip top open-delay="500">
            <template v-slot:activator="{ on }">
              <v-btn
                ref="btnValidate"
                class="ma-2 pr-4"
                tile
                color="success"
                v-if="!readonly"
                :disabled="!isValid"
                @click="sendExtrait"
                v-on="on"
              >
                <v-icon left>mdi-check</v-icon> Valider
              </v-btn>
            </template>
            <span>Valider les modifications<span class="shortcutTooltip"> alt + enter </span></span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import { Extrait, Ventilation, Journal } from '@/models/Financier';
import { FinancierApi } from '@/api/FinancierApi';
import VentilationVue from './Ventilation.vue';
import { Reglement } from '@/models/Financier/Get/Reglement';
import { DateTime } from '@/models/DateTime';
import { PromiseResponse } from '@/models/PromiseResponse';
import DeviseApi from '@/api/DeviseApi';
import DatePicker from '@/components/DatePicker.vue';

@Component({
  name: 'Extrait',
  components: { VentilationVue, DatePicker }
})
export default class extends Vue {
  @Ref() readonly refVentilationVue!: VentilationVue;

  private dialog = false;
  @PropSync('isReadOnly')
  public readonly!: boolean;
  @PropSync('DatePiece')
  public datePiece!: DateTime;
  private isNew = true;
  private errorMessage = '';
  private isValid = true;
  private resolve!: any;
  private reject!: any;
  private journal: Journal = new Journal();
  private numeroPiece = '';

  public get isOpened(): boolean {
    return this.dialog;
  }

  public get dataTableHeight(): number {
    return this.$vuetify.breakpoint.name == 'sm' || this.$vuetify.breakpoint.name == 'md' ? 200 : 400;
  }

  private numeroExtrait = 0;
  private typeCompte = '';
  private compteLoading = false;
  private numeroCompte = '';
  private nomCompte = '';
  private libelleCompte = '';
  private soldeInitial = '';
  private soldeActuel = '';

  private reglementsLoading = false;
  private reglements: Reglement[] = [];
  private reglementSelected: Reglement = new Reglement();
  private reglementsRules = [
    (v: Reglement) => !!v || 'Règlement obligatoire',
    (v: Reglement) => v.numero != 0 || 'Règlement obligatoire'
  ];

  private montant = '';
  private montantRules: any = [
    (v: string) => !!v || 'Montant obligatoire',
    (v: string) => v.isDecimal() || 'Montant invalide'
  ];

  private ventilations: Ventilation[] = [];
  private headersVentilation = [
    { text: 'Vent.', value: 'numeroVentilation', width: 40 },
    { text: 'Compte', value: 'libelleCompte', width: 120 },
    { text: 'Intitulé', value: 'nomCompte', width: 180 },
    { text: 'Pièce', value: 'libellePiece', width: 80 },
    { text: "Libellé d'écriture", value: 'libelle', width: 180 },
    { text: 'Débit', value: 'montantDebit', width: 100, align: 'end' },
    { text: 'Crédit', value: 'montantCredit', width: 100, align: 'end' },
    { text: 'Devise', value: 'libelleDevise', width: 70 },
    { text: 'TVA', value: 'libelleTva', width: 100 }
  ];

  private ventileBase = 0;
  private ventileDevise = 0;

  private dernierType = '';
  private derniereBase = '';

  mounted() {
    this.loadReglements();
  }

  public open(
    journal: Journal,
    numeroPiece: string,
    extrait: Extrait,
    soldeInitial: string,
    soldeActuel: string
  ): Promise<PromiseResponse<Extrait>> {
    this.reset();
    this.dialog = true;
    this.isNew = false;
    this.numeroPiece = numeroPiece;
    this.soldeInitial = soldeInitial;
    this.soldeActuel = soldeActuel;
    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.initJournal(journal);
      this.initExtrait(extrait);
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public openNew(journal: Journal, soldeInitial: string, soldeActuel: string): Promise<PromiseResponse<Extrait>> {
    this.reset();
    this.dialog = true;
    this.isNew = true;

    this.soldeInitial = soldeInitial;
    this.soldeActuel = soldeActuel;

    this.$nextTick(() => {
      (this.$refs.form as any).resetValidation();
      this.setReglement(5);
      this.initJournal(journal);
      this.$nextTick(() => {
        (this.$refs.montant as HTMLElement).focus();
      });
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  get typeMouvement(): string {
    return this.montant?.toNumber() > 0 ? 'DB' : 'CR';
  }

  get createVentilationEnabled() {
    return !this.readonly && this.montant;
  }

  private createVentilation() {
    if (this.readonly) return false;
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.montant && this.isValid) {
        this.refVentilationVue
          .openNew(this.getVentilationToAdd(), this.journal)
          .then((ventil) => {
            // On garde le type de compte/ nature case tva de la ventilation en mÃ©moire pour la ventilation TVA
            if(['C', 'F'].some((type) => type == ventil.typeCompte) && this.dernierType != ventil.typeCompte )  {
              this.dernierType = ventil.typeCompte;
            }
            if(['V', 'A'].some((base) => base == ventil.caseTva.natureCase) && this.derniereBase != ventil.caseTva.natureCase )  {
              this.derniereBase = ventil.caseTva.natureCase;
            }

            const maxLigne = this.ventilations?.length
              ? Math.max(...this.ventilations.map((i) => i.numeroVentilation))
              : 0;
            ventil.numeroVentilation = maxLigne + 1;
            this.ventilations.push(ventil);
            this.$nextTick(() => {
              if (this.ventileDevise != 0) { // S'il reste un montant Ã  ventiler
                this.createVentilation(); // On rÃ©ouvre la crÃ©ation d'une ventilation
              } else {
                this.sendExtrait(); // Sinon on crÃ©e l'extrait
              }
            });
          })
          .catch()
          .finally(() => {
            this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
          });
      }
    });
  }

  private editVentilation(ventilation: Ventilation) {
    this.refVentilationVue
      .open(ventilation, this.journal)
      .then((resp) => {
        if (resp)
          Vue.set(
            this.ventilations,
            this.ventilations.findIndex((d) => d == ventilation),
            resp
          );
        else this.ventilations.splice(this.ventilations.indexOf(ventilation), 1);
      })
      .catch()
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private initJournal(journal: Journal) {
    this.journal = journal;
    this.libelleCompte = `${journal.compteBanque.numero.toString()} ${journal.compteBanque.nom}`;
  }

  private taux = 0;
  @Watch('dateExtrait')
  private dateExtraitChange() {
    if (!this.journal.devise || this.journal.devise.id == 1) this.taux = 1;
    else if (this.datePiece.isValid() && this.journal?.devise?.id) {
      DeviseApi.getTaux(this.journal?.devise?.id, this.datePiece)
        .then((taux) => {
          this.taux = taux;
        })
        .catch();
    }
    this.refreshMontantAVentille();
  }

  private initExtrait(extrait: Extrait) {
    this.numeroExtrait = extrait.numeroExtrait;
    this.typeCompte = extrait.typeCompte;
    this.numeroCompte = extrait.numeroCompte.toString();
    this.nomCompte = extrait.nomCompte;
    this.ventilations = extrait.ventilations;
    this.montant = extrait.montantDeviseSigned.toNumber().toComptaString();
    this.setReglement(extrait.codeReglement, extrait.libelleReglement);
  }

  public getVentilationToAdd(): Ventilation {
    const ventilation = new Ventilation();
    ventilation.libelle = this.reglementSelected.libelle;
    ventilation.codeDevise = this.journal.devise.id;
    ventilation.libelleDevise = this.journal.devise.libelle;
    ventilation.montantDevise = Math.abs(this.ventileDevise);
    ventilation.montantBase = Math.abs(this.ventileDevise * (this.taux | 1));

    if(this.ventilations.length > 0) { // S'il existe déjà des ventilations
      const lastVentilation = this.ventilations[this.ventilations.length -1];
      if(this.ventilations.some((vent) => vent.caseTva.typeCase === 1) // S'il y a une ventilation avec une case TVA de type 1
        && this.ventileBase <= (this.getTvaCalcule() - this.getTvaImpute())) { // Et si le solde à ventiler est inférieur à (TVA calculée - TVA imputée)
        console.log('foo')
      }else{ // Sinon on propose le mouvement et type compte de la dernière ventilation
      ventilation.codeMouvement = lastVentilation.codeMouvement;
      ventilation.typeCompte = lastVentilation.typeCompte;
    }
    } // Si c'est la première ligne
    else if (this.montant.toNumber() > 0) {
      ventilation.codeMouvement = 'CR';
      ventilation.typeCompte = 'C';
    } else {
      ventilation.codeMouvement = 'DB';
      ventilation.typeCompte = 'F';
    }
    return ventilation;
  }

  private async setReglement(numero: number, libelleReglement = '') {
    if (!this.reglements) await this.loadReglements();

    const reglementSelected = this.reglements.find((r) => r.numero == numero);
    if (reglementSelected) this.reglementSelected = reglementSelected;
    else this.reglementSelected = new Reglement({ numero: 999, libelle: libelleReglement });
  }

  private async loadReglements() {
    try {
      this.reglementsLoading = true;
      this.reglements = await FinancierApi.getReglements();
    } finally {
      this.reglementsLoading = false;
    }
  }

  private reset() {
    this.numeroExtrait = 0;
    this.ventilations = [];
    this.libelleCompte = '';
    this.montant = '';
    this.reglementSelected = new Reglement();
  }

  @Watch('ventilations')
  @Watch('montant')
  private refreshMontantAVentille() {
    this.ventileBase = Math.abs(this.getVentileBase());
    this.ventileDevise = Math.abs(this.getVentileDevise());
  }

  private getVentileBase(ventilationToIgnore?: Ventilation): number {
    if (!this.ventilations || !this.journal) return 0;

    let ventileCompta = 0;
    if (this.journal.devise.id == 1) ventileCompta = this.montant.toNumber();
    else ventileCompta = this.montant.toNumber() * (this.taux | 0);

    const credit = this.ventilations
      .filter((c) => c.typeCompte != 'Z' && c != ventilationToIgnore)
      .map((c) => c.montantCredit.toNumber())
      .reduce((a, b) => a + b, 0);
    const debit = this.ventilations
      .filter((c) => c.typeCompte != 'Z' && c != ventilationToIgnore)
      .map((c) => c.montantDebit.toNumber())
      .reduce((a, b) => a + b, 0);
    ventileCompta = ventileCompta + debit - credit;
    return ventileCompta.toComptaString(2).toNumber();
  }

  public getVentileDevise(ventilationToIgnore?: Ventilation): number {
    if (!this.journal?.devise || !this.ventilations) return 0;

    let ventileDevise: number = this.montant.toNumber();
    const credit = this.ventilations
      .filter((c) => c.typeCompte != 'Z' && c.codeDevise == this.journal.devise.id && c != ventilationToIgnore)
      .map((c) => c.montantCredit.toNumber())
      .reduce((a, b) => a + b, 0);
    const debit = this.ventilations
      .filter((c) => c.typeCompte != 'Z' && c.codeDevise == this.journal.devise.id && c != ventilationToIgnore)
      .map((c) => c.montantDebit.toNumber())
      .reduce((a, b) => a + b, 0);

    ventileDevise = ventileDevise + debit - credit;
    return ventileDevise.toComptaString(this.journal.devise.typeDevise == 'E' ? 0 : 2).toNumber();
  }

  private getModel(): Extrait {
    const extrait = new Extrait();
    extrait.numeroExtrait = this.numeroExtrait;
    extrait.typeCompte = 'G';
    extrait.numeroCompte = this.journal.compteBanque.numero;
    extrait.nomCompte = this.journal.compteBanque.nom;
    extrait.montantBase = Math.abs(this.montant.toNumber() * (this.taux | 1));
    extrait.montantDevise = Math.abs(this.montant.toNumber());
    extrait.codeMouvement = this.montant.toNumber() > 0 ? 'DB' : 'CR';
    extrait.codeDevise = this.journal.devise.id;
    extrait.libelleDevise = this.journal.devise.libelle;
    extrait.codeReglement = this.reglementSelected.numero;
    extrait.libelleReglement = this.reglementSelected.libelle;
    extrait.ventilations = this.ventilations.map((v) => new Ventilation(v));
    return extrait;
  }

  private sendExtrait() {
    if (!(this.ventilations.length > 0)) {
      // If there's no ventilation
      this.dialog = false;
      this.reject();
    } else {
      (this.$refs.form as any).validate();
      this.$nextTick(() => {
        if (this.isValid) {
          this.dialog = false;
          this.resolve(new PromiseResponse<Extrait>(this.getModel(), this.ventileDevise != 0)); // Send true to trigger openNew again if ventileBase = 0
        }
      });
    }
  }

  public getTvaCalcule(ventilationToIgnore?: Ventilation): number {
    if (!this.ventilations) return 0;

    const montantsCaseTva: { case: number; caseTaux: number; montant: number }[] = [];
    this.ventilations
      .filter((c) => c !== ventilationToIgnore)
      .forEach((element) => {
        const montantCase = montantsCaseTva.find((c) => c.case == element.caseTva.numeroCase);
        if (montantCase) montantCase.montant += element.montantCredit.toNumber() - element.montantDebit.toNumber();
        else if (element.caseTva.typeCase > 0 && element.caseTva.typeCase < 4) {
          montantsCaseTva.push({
            case: element.caseTva.numeroCase,
            caseTaux: element.caseTva.tauxTvaCase,
            montant: element.montantCredit.toNumber() - element.montantDebit.toNumber()
          });
        }
      });

    return montantsCaseTva
      .map((c) => ((c.montant * c.caseTaux) / 100).toDecimalString(2).toNumber())
      .reduce((a, b) => a + b, 0)
      .toDecimalString(this.journal.devise.typeDevise == 'E' ? 0 : 2)
      .toNumber();
  }

  public getTvaImpute(ventilationToIgnore?: Ventilation): number {
    if (!this.ventilations) return 0;

    return this.ventilations
      .filter(
        (c) =>
          (c.caseTva.typeCase == 50 || c.caseTva.typeCase == 51) &&
          c.codeDevise == this.journal.devise.id &&
          c !== ventilationToIgnore
      )
      .map((c) => c.montantCredit.toNumber() - c.montantDebit.toNumber())
      .reduce((a, b) => a + b, 0);
  }

  private deleteExtrait() {
    if (!this.isNew && !this.readonly) {
      this.dialog = false;
      this.resolve(new PromiseResponse(null, false));
    }
  }

  private modifierPiece() {
    this.readonly = false;
    (this.$refs.montant as any)?.focus();
  }

  private close() {
    this.refVentilationVue?.close();
    this.dialog = false;
    this.reject();
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

#editContrepartie {
  z-index: 999;
}
</style>
