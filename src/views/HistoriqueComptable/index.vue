<template>
  <v-container
    fluid
    @keydown.f2.prevent="switchMode('historique')"
    @keydown.f3.prevent="switchMode('reportMensuel')"
    @keydown.f5.prevent="switchMode('reportJournalier')"
    @keydown.34.prevent="pgDown"
    @keydown.33.prevent="pgUp"
  >
    <v-card>
      <v-form ref="form" v-model="isSearchValid">
        <v-row align="start" justify="start" class="pl-5 pt-2 pb-2">
          <v-select
            class="mt-3 ml-2"
            style="max-width: 182px"
            id="indexSearch"
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
          <div class="ml-5 mt-3" style="width: 345px">
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
          </div>
          <div style="max-width: 150px" class="mt-3 ml-5">
            <date-picker
              outlined
              label="A partir de"
              :date.sync="fromDate"
              :rules="fromDateRules"
              ref="fromDateField"
              @change="loadDatas"
              hide-details
            />
          </div>
          <div class="mt-3 ml-2" style="max-width: 150px">
            <date-picker
              style="max-width: 150px"
              class="pt-3"
              outlined
              label="Jusqu'à"
              :date.sync="toDate"
              :rules="toDateRules"
              @change="loadDatas"
              hide-details
              ref="toDateField"
            />
          </div>
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
      <v-toolbar color="primary" dark flat dense>
        <v-row>
          <v-col cols="3"> Solde : {{ historique.solde.toComptaString() }} {{ historique.devise }} </v-col>
        </v-row>
      </v-toolbar>
      <v-data-table
        :items="historique.imputations"
        :headers="headersHistorique"
        disable-sort
        @click:row="openEcriture"
        dense
        class="elevation-1"
        :items-per-page="15"
        :page="page"
      >
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
          <v-row dense>
            <v-col cols="4" class="text-end">{{ item.codeMouvement == 'DB' ? item.mouvement : '' }}</v-col>
            <v-col cols="4" class="text-end">{{ item.codeMouvement == 'CR' ? item.mouvement : '' }}</v-col>
            <v-col cols="3" class="text-end">{{ item.libelleDevise }}</v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-5" v-if="!reportMensuel.isEmpty() && mode == 'reportMensuel'">
      <v-toolbar color="primary" dark flat dense>
        Total mensuel -- Depuis le {{ fromDate }} jusqu'au {{ toDate }}</v-toolbar
      >
      <v-data-table
        :items="reportMensuel"
        :headers="headersReport"
        :items-per-page="15"
        :page="page"
        dense
      ></v-data-table>
    </v-card>
    <v-card class="mt-5" v-if="!reportJournalier.isEmpty() && mode == 'reportJournalier'">
      <v-toolbar color="primary" dark flat dense>
        Total journalier -- Depuis le {{ fromDate }} jusqu'au {{ toDate }}</v-toolbar
      >
      <v-data-table
        :items="reportJournalier"
        :headers="headersReport"
        :items-per-page="15"
        :page="page"
        dense
      ></v-data-table>
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
import { HistoriqueInput } from '@/models/HistoriqueComptable/HistoriqueInput';
import { HistoriqueModule } from '@/store/modules/historiqueComptable';

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

  private get historique() {
    return HistoriqueModule.historique;
  }
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
    { text: 'C.A & TVA/mvt devise', value: 'chiffreAffaire', align: 'end' },
    { text: 'Case / Réf', value: 'caseRef', align: 'end' },
    { text: 'Lien', value: 'lien', align: 'end' },
  ];

  private headersReport = [
    { text: ' ', value: 'periodePad' },
    { text: 'Solde', value: 'soldeCompta', align: 'end' },
    { text: 'Débit', value: 'debitCompta', align: 'end' },
    { text: 'Débit Cumulé', value: 'debitCumuleCompta', align: 'end' },
    { text: 'Crédit', value: 'creditCompta', align: 'end' },
    { text: 'Crédit Cumulé', value: 'creditCumuleCompta', align: 'end' },
    { text: 'Solde Cumulé', value: 'soldeCumuleCompta', align: 'end' },
  ];

  private page = 1;

  mounted() {
    CompteApi.getTypesComptes().then((resp) => {
      this.typesComptes = resp;
    });
  }

  // Changer le type de compte avec les touches correspondantes
  private changeType(event: KeyboardEvent) {
    if (['c', 'f', 'g', 'z'].includes(event.key)) {
      if ('z' == event.key) this.typeCompteSelected = new TypeCompte({ id: 'Z', libelle: 'Extra-comptable' });
      this.$nextTick(() => (this.$refs.typesComptes as any).blur());
      this.$nextTick(() => this.compteComponent.focus());
    }
  }

  // Définir le compte selon la méthode utilisée avec l'AutocompleteComptes
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
      this.loadDatas();
    } else if (
      compte instanceof CompteGeneralSearch ||
      compte instanceof CompteSearch ||
      compte instanceof CompteDeTier
    ) {
      this.numeroCompte = compte.numero.toString();
      this.fromDate = '';
      this.loadDatas();
    }
  }

  private async loadHistorique() {
    
    const input: HistoriqueInput = {
      typeCompte: this.typeCompteSelected.id,
      numeroCompte: +this.numeroCompte,
      startDate: this.fromDate,
      endDate: this.toDate,
    };

    await HistoriqueModule.fetchHistorique(input);
  }

  // Ouvre la modal pour afficher les détails de l'écriture
  private openEcriture(imputation: Imputation) {
    this.ecritureModal.open(
      imputation.codeJournal,
      imputation.numeroPiece,
      imputation.codeLigneExtrait,
      imputation.codeLigneVentilation,
      imputation.operation
    );
  }

  // Permette de charger les données seulement si le compte est bien défini
  get canLoadDatas() {
    return this.typeCompteSelected.id != '' && this.numeroCompte;
  }

  // Charger les données en fonction du mode
  private loadDatas() {
    if (this.canLoadDatas) {
      if (this.mode == 'historique') {
        this.loadHistorique();
      } else if (this.mode == 'reportMensuel') {
        this.loadReportMensuel();
      } else if (this.mode == 'reportJournalier') {
        this.loadReportJournalier();
      } else {
        console.log('Invalid mode');
      }
      this.page = 1;
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

  // Changer le mode d'affichage
  private switchMode(mode: string) {
    this.mode = mode;
    this.loadDatas();
  }

  private resetCompte() {
    this.compteComponent.resetCompte();
    this.numeroCompte = '';
  }

  private pgDown() {
    this.page++;
  }

  private pgUp() {
    this.page--;
  }
}
</script>

<style>
.shortcutTooltip {
  color: white !important;
}

.table.cell-height {
  max-height: 20px;
}
</style>