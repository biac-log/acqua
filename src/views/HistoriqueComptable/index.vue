<template>
  <v-container fluid>
    <v-card>
      <v-form ref="form" v-model="isSearchValid">
        <v-row align="start" justify="start" class="pl-5">
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
            />
          </v-col>
          <v-col lg="2">
            <date-picker
              outlined
              label="A partir de"
              :date.sync="fromDate"
              :rules="fromDateRules"
              ref="fromDateField"
              @change="loadHistorique"
            />
          </v-col>
          <v-col lg="2">
            <date-picker outlined label="Jusqu'à" :date.sync="toDate" :rules="toDateRules" @change="loadHistorique" />
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <v-card class="mt-5">
      <v-data-table :items="historique.imputations" :headers="headers" disable-sort>
        <template v-slot:[`item.pieceDesc`]="{ item }">
          <span>{{ item.pieceDesc }}</span>
          <span class="pl-4">{{ item.libellePiece }}</span>
        </template>
        <template v-slot:[`header.creditDebit`]="">
          <v-row dense>
            <v-col cols="3" class="text-end">Crédit</v-col>
            <v-col cols="3" class="text-end">Débit</v-col>
          </v-row>
        </template>
        <template v-slot:[`item.creditDebit`]="{ item }">
          <v-row>
            <v-col cols="3" class="text-end">{{ item.codeMouvement == 'CR' ? item.mouvement : '' }}</v-col>
            <v-col cols="3" class="text-end">{{ item.codeMouvement == 'DB' ? item.mouvement : '' }}</v-col>
            <v-col cols="3" class="text-end">{{ item.libelleDevise }}</v-col>
          </v-row>
        </template>
        <template v-slot:[`item.chiffreDAffaire`]="{ item }">
          <span>{{ item.chiffreDAffaire.toComptaString() }}</span>
          <span class="pl-6">{{ item.cumulTva.toComptaString() }}</span>
        </template>
      </v-data-table>
    </v-card>
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

@Component({
  name: 'HistoriqueComptableIndex',
  components: { AutocompleteComptesVue, DatePicker },
})
export default class HistoriqueComptableIndex extends Vue {
  @Ref() private compteComponent!: AutocompleteComptesVue;
  @Ref() private form!: AutocompleteComptesVue;
  @Ref() private fromDateField!: DatePicker;

  private isSearchValid = false;
  private typesComptes: TypeCompte[] = [];
  private typeCompteSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private numeroCompte = '';
  private numeroCompteRules: any = [(v: string) => !!v || 'Numéro obligatoire'];

  private fromDate = '';
  private fromDateRules: any = [
    (v: string) => DateTime.isValid(v) || 'Date invalide',
  ];
  private toDate = '';
  private toDateRules: any = [
    (v: string) => DateTime.isValid(v) || 'Date invalide',
  ];

  private historique: HistoriqueComptable = new HistoriqueComptable();

  private headers = [
    { text: 'Date', value: 'dateDisplay' },
    { text: 'Pièce', value: 'pieceDesc' },
    { text: 'Libellé', value: 'libellePiece' },
    { text: 'Crédit / Débit', value: 'creditDebit' },
    { text: 'C.A & TVA/mvt devise', value: 'chiffreDAffaire', align: 'end' },
    { text: 'Case / Réf', value: 'caseRef', align: 'end' },
    { text: 'Lien', value: 'lien', align: 'end' },
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
    });
  }

  private resetCompte() {
    this.compteComponent.resetCompte();
    this.numeroCompte = '';
  }
}
</script>

<style>
</style>