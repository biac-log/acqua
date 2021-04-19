<template>
  <v-card class="pb-0" outlined>
    <v-toolbar color="#EEEEEE" flat>
      <v-card-title>
        Lignes de l'extrait
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              fab
              small
              class="ml-5"
              ref="btnAdd"
              :disabled="readonly"
              @click.stop="createExtrait"
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Ajouter une ligne <span class="shortcutTooltip"> + </span></span>
        </v-tooltip>
      </v-card-title>
      <v-spacer></v-spacer>
      <v-btn color="info" @click="toggleVentilation">
        {{ displayVentilation ? 'Cacher la ventilation' : 'Afficher la ventilation' }}
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headersExtraits"
      :items="extraits"
      :loading="isLoading"
      height="530px"
      id="dataTable"
      class="elevation-1 pa-0 ma-0"
      disable-pagination
      hide-default-footer
      @click:row="editExtrait"
      fixed-header
      disable-sort
      dense
    >
      <template v-slot:item="{ item }">
        <tr :class="getClassRowParent(item)" :key="item.id" @click="editExtrait(item)">
          <td align="left">{{ item.numeroExtrait }}</td>
          <!-- <td></td> -->
          <td>{{ item.libelleCompte }}</td>
          <td>{{ item.nomCompte }}</td>
          <td></td>
          <td>{{ item.libelleReglement }}</td>
          <td align="right">{{ item.montantDebit }}</td>
          <td align="right">{{ item.montantCredit }}</td>
          <td></td>
          <td></td>
        </tr>
        <template v-if="displayVentilation">
          <tr
            class="rowChild"
            v-for="(ventilation, index) in item.ventilations"
            :key="`${item.numeroExtrait}.${ventilation.numeroVentilation}`"
            :class="index != Object.keys(item.ventilations).length - 1 ? '' : 'lastChild'"
            @click="editExtrait(item)"
          >
            <td align="left">{{ `${item.numeroExtrait}.${ventilation.numeroVentilation}` }}</td>
            <!-- <td align="right">{{ ventilation.numeroVentilation }}</td> -->
            <td>{{ `${ventilation.typeCompte} ${ventilation.numeroCompte}` }}</td>
            <td>{{ ventilation.nomCompte }}</td>
            <td>
              {{ ventilation.referenceJournal ? `${ventilation.referenceJournal}.${ventilation.referencePiece}` : '' }}
            </td>
            <td>{{ ventilation.libelle }}</td>
            <td align="right">{{ ventilation.montantDebit }}</td>
            <td align="right">{{ ventilation.montantCredit }}</td>
            <td>{{ ventilation.libelleDevise }}</td>
            <td>{{ ventilation.codeCaseTVA || '' }}</td>
          </tr>
        </template>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from 'vue-property-decorator';
import { Journal, Extrait } from '@/models/Financier';
import ExtraitVue from './Extrait.vue';
import { DateTime } from '@/models/DateTime';

@Component({
  name: 'ExtraitsVue',
  components: { ExtraitVue }
})
export default class extends Vue {
  private ventilleDevise = 0;
  private ventilleBase = 0;
  @PropSync('IsReadOnly')
  public readonly!: boolean;
  @PropSync('Extraits')
  private extraits!: Extrait[];
  @PropSync('Journal')
  private journal!: Journal;
  @PropSync('DatePiece')
  private datePiece!: DateTime;
  @PropSync('IsLoading')
  private isLoading!: boolean;
  private displayVentilation = true;

  private getClassRowParent(extrait: Extrait): string {
    if (!extrait.isEquilibre) return 'notEquilibre';
    else if (extrait.numeroExtrait != 1) return this.displayVentilation ? 'rowParent' : '';
    else return '';
  }

  private headersExtraits = [
    { text: 'Ex', value: 'numeroExtrait', width: 20 },
    //{ text: "Ven", value: "", width: 20 },
    { text: 'Compte', value: 'libelleCompte', width: 150 },
    { text: 'Intitulé', value: 'nomCompte' },
    { text: 'Pièce', value: '', width: 200 },
    { text: "Libellé d'écriture", value: '', width: 300 },
    { text: 'Débit', value: 'montantDebit', width: 100, align: 'end' },
    { text: 'Crédit', value: 'montantCredit', width: 100, align: 'end' },
    { text: 'Devise', value: 'libelleDevise', width: 80 },
    { text: 'TVA', value: 'tva', width: 80 }
  ];

  public createExtrait() {
    this.$emit('CreateExtrait');
  }

  @Emit('EditExtrait')
  public editExtrait(extrait: Extrait): Extrait {
    return extrait;
  }

  public focus() {
    this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
  }

  private toggleVentilation() {
    this.displayVentilation = !this.displayVentilation;
    this.focus();
  }
}
</script>

<style lang="scss" scoped>
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}

.notEquilibre {
  background-color: rgb(253, 187, 170, 0.8);
  td {
    border-top: thin solid rgba(0, 0, 0);
    margin-top: -1px;
  }

  &:hover {
    border-top: thin solid rgba(0, 0, 0);
    background-color: rgb(253, 187, 170) !important;
  }
}

.rowParent td {
  border-top: thin solid rgba(0, 0, 0, 0.5);
  margin-top: -1px;
}

.rowChild td {
  background-color: rgba(0, 0, 0, 0.06);
  margin-top: -1px;
}

.lastChild td {
  border-bottom: 0 !important;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}
</style>
