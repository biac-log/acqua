<template>
  <v-container
    fluid
    @keydown.f2.prevent="switchMode('historique')"
    @keydown.f3.prevent="switchMode('reportMensuel')"
    @keydown.f5.prevent="switchMode('reportJournalier')"
  >
    <v-card>
      <v-form ref="form" v-model="isSearchValid">
        <v-row align="start" justify="start" class="pl-5 pt-2 pb-2">
          <v-col cols="12" xs="12" sm="6" lg="2">
            <v-select
              ref="typesComptes"
              autofocus
              label="Type de compte"
              outlined
              required
              :items="typesComptes"
              v-model="typeCompteSelected"
              return-object
              item-text="libelle"
              :rules="typesComptesRules"
              @keyup="changeType"
              @change="resetCompte"
              hide-details
            />
          </v-col>
          <v-col lg="2" class="pl-5">
            <AutocompleteComptesVue
              ref="compteComponent"
              :typeCompte.sync="typeCompteSelected.id"
              label="Compte"
              outlined
              :disabled="!typeCompteSelected.id"
              @change="compteChange"
              :rules="numeroCompteRules"
              hide-details
            />
          </v-col>
          <v-col lg="2">
            <date-picker
              outlined
              label="A partir de"
              :date.sync="fromDate"
              :rules="fromDateRules"
              ref="fromDateField"
              @change="loadDatas"
              hide-details
            />
          </v-col>
          <v-col lg="2">
            <date-picker
              outlined
              label="Jusqu'à"
              :date.sync="toDate"
              :rules="toDateRules"
              @change="loadDatas"
              hide-details
              ref="toDateField"
            />
          </v-col>
          <v-spacer />
          <v-col cols="2">
            <v-select
              label="Affichage"
              class="pr-5"
              :items="modes"
              v-model="mode"
              item-text="text"
              item-value="value"
              outlined
              @change="loadDatas"
              hide-details
            >
              <template v-slot:item="{ item }">
                <span>{{ item.text }}</span>
                <span class="shortcutTooltip">{{ item.shortcut }}</span>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <v-card class="mt-5" v-if="historique.imputations.length > 0 && mode == 'historique'">
      <v-toolbar color="primary" dark flat>
        <v-row>
          <v-col cols="3"> Solde : {{ historique.solde.toComptaString() }} {{ historique.devise }} </v-col>
        </v-row>
      </v-toolbar>
      <v-data-table :items="historique.imputations" :headers="headersHistorique" disable-sort @click:row="openEcriture">
        <template v-slot:[`item.pieceDesc`]="{ item }">
          <span>{{ item.pieceDesc }}</span>
          <span class="pl-4">{{ item.libellePiece }}</span>
        </template>
        <template v-slot:[`header.creditDebit`]="">
          <v-row dense>
            <v-col cols="4" class="text-end">Débit</v-col>
            <v-col cols="4" class="text-end">Crédit</v-col>
          </v-row>
        </template>
        <template v-slot:[`item.creditDebit`]="{ item }">
          <v-row>
            <v-col cols="4" class="text-end">{{ item.codeMouvement == 'DB' ? item.mouvement : '' }}</v-col>
            <v-col cols="4" class="text-end">{{ item.codeMouvement == 'CR' ? item.mouvement : '' }}</v-col>
            <v-col cols="3" class="text-end">{{ item.libelleDevise }}</v-col>
          </v-row>
        </template>
        <template v-slot:[`item.chiffreDAffaire`]="{ item }">
          <span>{{ item.chiffreDAffaire.toComptaString() }}</span>
          <span class="pl-6">{{ item.cumulTva.toComptaString() }}</span>
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-5" v-if="mode == 'reportMensuel'">
      <v-toolbar color="primary" dark flat> Report mensuel -- Depuis le {{ fromDate }} jusqu'au {{ toDate }}</v-toolbar>
      <v-data-table :items="reportMensuel" :headers="headersReport"></v-data-table>
    </v-card>
    <v-card class="mt-5" v-if="mode == 'reportJournalier'">
      <v-toolbar color="primary" dark flat>
        Report journalier -- Depuis le {{ fromDate }} jusqu'au {{ toDate }}</v-toolbar
      >
      <v-data-table :items="reportJournalier" :headers="headersReport"></v-data-table>
    </v-card>
    <ecriture-vue ref="ecritureModal" />
  </v-container>
</template>

<script lang='ts'>
import CompteApi from '@/api/CompteApi';
import HistoriqueComptableApi from '@/api/HistoriqueComptableApi';
import { TypeCompte } from '@/models/Compte/TypeCompte';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import DatePicker from '@/components/DatePicker.vue';
import { DateTime } from '@/models/DateTime';
import { HistoriqueComptable } from '@/models/HistoriqueComptable/HistoriqueComptable';
import EcritureVue from '@/views/HistoriqueComptable/components/Ecriture.vue';
import { Imputation } from '@/models/HistoriqueComptable/Imputation';
import { LigneReport } from '@/models/HistoriqueComptable/LigneReport';

@Component({
  name: 'HistoriqueComptableIndex',
  components: { AutocompleteComptesVue, DatePicker, EcritureVue },
})
export default class HistoriqueComptableIndex extends Vue {
  @Ref() private compteComponent!: AutocompleteComptesVue;
  @Ref() private form!: AutocompleteComptesVue;
  @Ref() private fromDateField!: DatePicker;
  @Ref() private toDateField!: DatePicker;
  @Ref() private ecritureModal!: EcritureVue;

  private isSearchValid = false;
  private typesComptes: TypeCompte[] = [];
  private typeCompteSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private numeroCompte = '';
  private numeroCompteRules: any = [(v: string) => !!v || 'Numéro obligatoire'];

  private fromDate = '';
  private fromDateRules: any = [(v: string) => DateTime.isValid(v) || 'Date invalide'];
  private toDate = '';
  private toDateRules: any = [(v: string) => DateTime.isValid(v) || 'Date invalide'];

  private historique: HistoriqueComptable = new HistoriqueComptable();
  private reportMensuel: LigneReport[] = [];
  private reportJournalier: LigneReport[] = [];

  private mode = 'historique';
  private modes = [
    { text: 'Historique', value: 'historique', shortcut: 'F2' },
    { text: 'Report mensuel', value: 'reportMensuel', shortcut: 'F3' },
    { text: 'Report journalier', value: 'reportJournalier', shortcut: 'F5' },
  ];

  private headersHistorique = [
    { text: 'Date', value: 'dateDisplay' },
    { text: 'Pièce', value: 'pieceDesc' },
    { text: 'Crédit / Débit', value: 'creditDebit' },
    { text: 'C.A & TVA/mvt devise', value: 'chiffreDAffaire', align: 'end' },
    { text: 'Case / Réf', value: 'caseRef', align: 'end' },
    { text: 'Lien', value: 'lien', align: 'end' },
  ];

  private headersReport = [
    { text: ' ', value: 'periode' },
    { text: 'Solde', value: 'soldeCompta', align: 'end' },
    { text: 'Débit', value: 'debitCompta', align: 'end' },
    { text: 'Débit Cumulé', value: 'debitCumuleCompta' },
    { text: 'Crédit', value: 'creditCompta', align: 'end' },
    { text: 'Crédit Cumulé', value: 'creditCumuleCompta' },
    { text: 'Solde Cumulé', value: 'soldeCumuleCompta', align: 'end' },
  ];

  mounted() {
    CompteApi.getTypesComptes().then((resp) => {
      this.typesComptes = resp;
    });
  }

  private changeType(event: KeyboardEvent) {
    if (['c', 'f', 'g', 'z'].includes(event.key)) {
      if ('z' == event.key) this.typeCompteSelected = new TypeCompte({ id: 'Z', libelle: 'Extra-comptable' });
      this.$nextTick(() => (this.$refs.typesComptes as any).blur());
      this.$nextTick(() => this.compteComponent.focus());
    }
  }

  private async compteChange(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.numeroCompte = '';
    } else if (
      typeof compte === 'string' &&
      (this.typeCompteSelected.id == 'C' || this.typeCompteSelected.id == 'F') &&
      compte.length == 8
    ) {
      this.numeroCompte = compte;
      this.fromDate = '';
      this.loadHistorique();
    } else if (
      compte instanceof CompteGeneralSearch ||
      compte instanceof CompteSearch ||
      compte instanceof CompteDeTier
    ) {
      this.numeroCompte = compte.numero.toString();
      this.fromDate = '';
      this.loadHistorique();
    }
  }

  private async loadHistorique() {
    this.historique = new HistoriqueComptable();
    await HistoriqueComptableApi.getHistorique(
      this.typeCompteSelected.id,
      +this.numeroCompte,
      this.fromDate,
      this.toDate
    ).then((historique) => {
      this.historique = historique;
      this.fromDateField.initFromString(historique.fromDate.toString());
      this.toDateField.initFromString(historique.toDate.toString());
    });
  }

  private openEcriture(imputation: Imputation) {
    this.ecritureModal.open(
      imputation.codeJournal,
      imputation.numeroPiece,
      imputation.codeLigneExtrait,
      imputation.codeLigneVentilation
    );
  }

  private loadDatas() {
    if (this.mode == 'historique') {
      this.loadHistorique();
    } else if (this.mode == 'reportMensuel') {
      this.loadReportMensuel();
    } else if (this.mode == 'reportJournalier') {
      this.loadReportJournalier();
    } else {
      console.log('Invalid mode');
    }
  }

  private async loadReportMensuel() {
    HistoriqueComptableApi.getReportMensuel(
      this.typeCompteSelected.id,
      +this.numeroCompte,
      this.fromDate,
      this.toDate
    ).then((resp) => {
      this.reportMensuel = resp;
    });
  }

  private async loadReportJournalier() {
    HistoriqueComptableApi.getReportJournalier(
      this.typeCompteSelected.id,
      +this.numeroCompte,
      this.fromDate,
      this.toDate
    ).then((resp) => {
      this.reportJournalier = resp;
    });
  }

  private switchMode(mode: string) {
    this.mode = mode;
    this.loadDatas();
  }

  private resetCompte() {
    this.compteComponent.resetCompte();
    this.numeroCompte = '';
  }
}
</script>

<style>
.shortcutTooltip {
  color: white !important;
}
</style>