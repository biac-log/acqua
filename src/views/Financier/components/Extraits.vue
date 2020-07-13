<template>
  <v-container class="ma-0 pa-0">
    <v-card class="mb-3">
      <v-card-title>
        Extraits
        <v-btn
          color="primary"
          fab
          small
          class="ml-5"
          ref="btnAdd"
          :disabled="readonly"
          @click.stop="createExtrait"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <ExtraitVue
          ref="refExtraitVue"
          :isReadOnly.sync="readonly"
        ></ExtraitVue>
      </v-card-title>
      <v-data-table
        :headers="headersExtraits"
        :items="extraits"
        id="dataTable"
        class="elevation-1"
        disable-pagination
        hide-default-footer
        @click:row="editExtrait"
        disable-sort
        dense
      >
        <template v-slot:item="{ item }">
          <tr class="rowParent" :key="item.id" @click="editExtrait(item)">
            <td>{{ item.numeroExtrait }}</td>
            <td></td>
            <td>{{ item.libelleCompte }}</td>
            <td>{{ item.nomCompte }}</td>
            <td></td>
            <td>{{ item.libelleReglement }}</td>
            <td>{{ item.montantDebit }}</td>
            <td>{{ item.montantCredit }}</td>
            <td></td>
            <td></td>
          </tr>
          <tr class="rowChild" v-for="ventilation in item.ventilations" :key="`${item.numeroExtrait}.${ventilation.numeroVentilation}`">
            <td ></td>
            <td >{{ ventilation.numeroVentilation }}</td>
            <td >{{ `${ventilation.typeCompte} ${ventilation.nomCompte}` }}</td>
            <td >{{ ventilation.nomCompte }}</td>
            <td >{{ `${ventilation.referenceJournal}.${ventilation.referencePiece}` }}</td>
            <td >{{ ventilation.libelle }}</td>
            <td >{{ ventilation.montantDebit }}</td>
            <td >{{ ventilation.montantCredit }}</td>
            <td >{{ ventilation.libelleDevise }}</td>
            <td >{{ ventilation.codeCaseTVA }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <!-- <span :class="ventilleBase == 0 ? 'equilibre' : 'notEquilibre'">
      <span >Montant à ventille : <b>{{ ventilleDevise }} {{ devise ? devise.libelle : "EUR" }}</b></span>
      <span v-if="devise && devise.id != 1">/ <b>{{ ventilleBase }} EUR</b></span>
    </span> -->
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop, Watch } from "vue-property-decorator";
import { Devise, Journal, Extrait, Ventilation } from "@/models/Financier";
import { FinancierApi } from "@/api/FinancierApi";
import axios from "axios";
import { CompteApi } from '@/api/CompteApi';
import ExtraitVue from "./Extrait.vue";

@Component({
  name: "ExtraitsVue",
  components: { ExtraitVue }
})
export default class extends Vue {
  private ventilleDevise: number = 0;
  private ventilleBase: number = 0;
  @PropSync("IsReadOnly") 
  public readonly!: boolean;
  @PropSync('Extraits')
  private extraits!: Extrait[];
  @PropSync('Journal')
  private journal!: Journal;

  private headersExtraits = [
    { text: "Ex", value: "numeroExtrait", width:50 },
    { text: "Ven", value: "", width:50 },
    { text: "Compte", value: "libelleCompte", width:200 },
    { text: "Intitulé", value: "nomCompte", width:200  },
    { text: "Pièce", value: "", width:100  },
    { text: "Libellé d'écriture", value: "", width:200 },
    { text: "Débit", value: "montantDebit", width:100  },
    { text: "Crédit", value: "montantCredit", width:100  },
    { text: "Devise", value: "libelleDevise", width:80  },
    { text: "TVA", value: "tva", width:50  },
  ];

  public createExtrait(extrait?: Extrait) {
    (this.$refs.refExtraitVue as ExtraitVue).openNew(this.journal)
    // .then((resp: PieceComptableContrepartie) => {
    //   const maxLigne = Math.max(...this.contreparties.map(i => i.numeroLigne))
    //   resp.numeroLigne = maxLigne + 1;
    //   this.contreparties.push(resp);
    // })
    .finally(() => {
      this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
    });
  }

  private editExtrait(extrait: Extrait) {
    (this.$refs.refExtraitVue as ExtraitVue).open(this.journal, extrait);
    // (this.$refs.editContrepartie as EditContrepartieVue)
    //   .open(piece, this.journal.numero, this.devise, this.getVentileDevise(piece), this.getTvaCalcule(piece), this.getTvaImpute(piece))
    //   .then((resp: PieceComptableContrepartie) => {
    //     if(resp){
    //       let contrepartie = this.contreparties.find(d => d == piece);
    //       if(contrepartie)
    //         Vue.set(this.contreparties, this.contreparties.findIndex(d => d == piece), resp);
    //       else this.contreparties.push(resp);
    //     }
    //     else this.contreparties.splice(this.contreparties.indexOf(piece), 1);
    //   }).finally(() => {
    //     this.refreshMontantAVentille();
    //     this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
    //   });
  }

  public async createContrepartie(){
    // if(!this.numeroCompteAchatVente || this.numeroCompteAchatVente == "0")
    //   this.addContrepartie();

    // if(this.contreparties.length == 0)
    // {
    //   let compteAchatVente = await CompteApi.getCompteGeneral("G", this.numeroCompteAchatVente);
    //   let tva = await AchatVenteApi.getCaseTVA(compteAchatVente.numeroCase, this.journal.numero);
    //   let contrepartie = new PieceComptableContrepartie();
    //   contrepartie.numeroCompte = compteAchatVente.numero;
    //   contrepartie.compteLibelle = compteAchatVente.nom;
    //   contrepartie.libelle = this.nomCompteDeTier;
    //   contrepartie.codeMouvement = this.journal.codeMouvement == "DB" ? "CR" : "DB";
    //   contrepartie.montantDevise = (+this.montantDevise / (1+(tva.tauxTvaCase/100)));
    //   contrepartie.montantBase = +this.montantDevise / (1+(tva.tauxTvaCase/100));
    //   contrepartie.caseTva = tva;
    //   this.addContrepartie(contrepartie);
    // }
    // else
    // {
    //   let ventileDevise = this.getVentileDevise();
    //   let tvaCalcule = this.getTvaCalcule();
    //   let tvaImpute = this.getTvaImpute();
    //   if(ventileDevise == (tvaCalcule - tvaImpute)){
    //     let codepays = this.contreparties.find(ctr => ['BX', 'VX', 'FX', 'IX'].indexOf(ctr.caseTva.natureCase))?.caseTva.codePays;
    //     let compteTva = await AchatVenteApi.getCompteTva(this.journal.numero, this.codeTaxe, codepays);
    //     let tva = await AchatVenteApi.getCaseTVA(compteTva.numeroCase, this.journal.numero);
    //     let contrepartie = new PieceComptableContrepartie();
    //     contrepartie.numeroCompte = compteTva.numero;
    //     contrepartie.compteLibelle = compteTva.nom;
    //     contrepartie.libelle = this.nomCompteDeTier;
    //     contrepartie.codeMouvement = this.journal.codeMouvement == "DB" ? "CR" : "DB";
    //     contrepartie.montantDevise = Math.abs(tvaCalcule- tvaImpute);
    //     contrepartie.montantBase = Math.abs((tvaCalcule - tvaImpute) * + this.tauxDevise);
    //     contrepartie.caseTva = tva;
    //     this.addContrepartie(contrepartie);
    //   }
    //   else this.addContrepartie();
    // }
  }
 
}
</script>

<style lang="scss">
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}

.notEquilibre{
  color: red;
  margin-left: 10px;
}

.equilibre{
  color: green;
  margin-left: 10px;
}

.rowParent{
  background-color: lightgray;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}
</style>
