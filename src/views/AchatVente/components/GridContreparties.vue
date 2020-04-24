<template>
  <v-container class="ma-0 pa-0">
    <v-card class="mb-3">
      <v-card-title>
        Contreparties
        <v-btn
          color="primary"
          fab
          small
          class="ml-5"
          ref="btnAdd"
          :disabled="readonly"
          @click.stop="createContrepartie"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <EditContrepartieVue
          ref="editContrepartie"
          :isReadOnly.sync="readonly"
        ></EditContrepartieVue>
      </v-card-title>
      <v-data-table
        :headers="headersContreparties"
        :items="contreparties"
        id="dataTable"
        class="elevation-1"
        :dense="contreparties.length > 8"
        disable-pagination
        hide-default-footer
        @click:row="editContrepartie"
      >
      </v-data-table>
    </v-card>
    <span :class="ventilleBase == 0 ? 'equilibre' : 'notEquilibre'">
      <span >Montant à ventille : <b>{{ ventilleDevise }} {{ devise ? devise.libelle : "EUR" }}</b></span>
      <span v-if="devise.id != 1">/ <b>{{ ventilleBase }} EUR</b></span>
    </span>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop, Watch } from "vue-property-decorator";
import { PieceComptableContrepartie, Devise, Journal } from "@/models/AchatVente";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import axios from "axios";
import EditContrepartieVue from "./EditContrepartie.vue";
import { CompteDeTier } from '../../../models/Compte/CompteDeTier';
import { CompteApi } from '@/api/CompteApi';

@Component({
  name: "GridContreparties",
  components: { EditContrepartieVue }
})
export default class extends Vue {
  @PropSync("IsReadOnly")
  public readonly!: boolean;
  @PropSync("Contreparties")
  private contreparties!: PieceComptableContrepartie[];
  @PropSync("Journal")
  private journal!: Journal;
  @PropSync("DeviseEntete")
  private devise!: Devise;
  @PropSync("CompteAchatVente")
  private numeroCompteAchatVente!: string;
  @PropSync("MontantDevise")
  private montantDevise!: string;
  @PropSync("MontantBase")
  private montantBase!: string;
  @PropSync("NomCompteDeTier")
  private nomCompteDeTier!: string;
  @PropSync("CodeTaxe")
  private codeTaxe!: number;
  @PropSync("TauxDevise")
  private tauxDevise!: string;

  private ventilleDevise: number = 0;
  private ventilleBase: number = 0;

  private headersContreparties = [
    { text: "N° Compte", value: "libelleNumero" },
    { text: "Nom compte", value: "compteLibelle" },
    { text: "Libelle", value: "libelle" },
    { text: "Débit", value: "montantDebit", align: "end" },
    { text: "Crédit", value: "montantCredit", align: "end" },
    { text: "Devise", value: "libelleDevise" },
    { text: "Case TVA", value: "libelleCaseTva" }
  ];

  private addContrepartie(contrepartie?: PieceComptableContrepartie) {
    (this.$refs.editContrepartie as EditContrepartieVue)
      .openNew(this.journal.numero, this.devise, this.getVentileDevise(), this.getTvaCalcule(), this.getTvaImpute(), contrepartie)
      .then((resp: PieceComptableContrepartie) => {
        const maxLigne = Math.max(...this.contreparties.map(i => i.numeroLigne))
        resp.numeroLigne = maxLigne + 1;
        this.contreparties.push(resp);
      }).finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private editContrepartie(piece: PieceComptableContrepartie) {
    (this.$refs.editContrepartie as EditContrepartieVue)
      .open(piece, this.journal.numero, this.devise, this.getVentileDevise(piece), this.getTvaCalcule(piece), this.getTvaImpute(piece))
      .then((resp: PieceComptableContrepartie) => {
        if(resp){
          let contrepartie = this.contreparties.find(d => d == piece);
          if(contrepartie)
            Vue.set(this.contreparties, this.contreparties.findIndex(d => d == piece), resp);
          else this.contreparties.push(resp);
        }
        else this.contreparties.splice(this.contreparties.indexOf(piece), 1);
      }).finally(() => {
        this.refreshMontantAVentille();
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  public async createContrepartie(){
    if(!this.numeroCompteAchatVente || this.numeroCompteAchatVente == "0")
      this.addContrepartie();

    if(this.contreparties.length == 0)
    {
      let compteAchatVente = await CompteApi.getCompteGeneral("G", this.numeroCompteAchatVente);
      let tva = await AchatVenteApi.getCaseTVA(compteAchatVente.numeroCase, this.journal.numero);
      let contrepartie = new PieceComptableContrepartie();
      contrepartie.numeroCompte = compteAchatVente.numero;
      contrepartie.compteLibelle = compteAchatVente.nom;
      contrepartie.libelle = this.nomCompteDeTier;
      contrepartie.codeMouvement = this.journal.codeMouvement == "DB" ? "CR" : "DB";
      contrepartie.montantDevise = (+this.montantDevise / (1+(tva.tauxTvaCase/100)));
      contrepartie.montantBase = +this.montantDevise / (1+(tva.tauxTvaCase/100));
      contrepartie.caseTva = tva;
      this.addContrepartie(contrepartie);
    }
    else
    {
      let ventileDevise = this.getVentileDevise();
      let tvaCalcule = this.getTvaCalcule();
      let tvaImpute = this.getTvaImpute();
      if(ventileDevise == (tvaCalcule - tvaImpute)){
        let codepays = this.contreparties.find(ctr => ['BX', 'VX', 'FX', 'IX'].indexOf(ctr.caseTva.natureCase))?.caseTva.codePays;
        let compteTva = await AchatVenteApi.getCompteTva(this.journal.numero, this.codeTaxe, codepays);
        let tva = await AchatVenteApi.getCaseTVA(compteTva.numeroCase, this.journal.numero);
        let contrepartie = new PieceComptableContrepartie();
        contrepartie.numeroCompte = compteTva.numero;
        contrepartie.compteLibelle = compteTva.nom;
        contrepartie.libelle = this.nomCompteDeTier;
        contrepartie.codeMouvement = this.journal.codeMouvement == "DB" ? "CR" : "DB";
        contrepartie.montantDevise = Math.abs(tvaCalcule- tvaImpute);
        contrepartie.montantBase = Math.abs((tvaCalcule - tvaImpute) * + this.tauxDevise);
        contrepartie.caseTva = tva;
        this.addContrepartie(contrepartie);
      }
      else this.addContrepartie();
    }
  }

  private getVentileBase(contrepartieToIgnore?: PieceComptableContrepartie): number{
    if(!this.contreparties || ! this.journal)
      return 0;

    let ventileCompta : number = +this.montantBase;
    if(this.journal.codeMouvement == "CR")
      ventileCompta = ventileCompta * -1;

    let credit = this.contreparties.filter(c => c.typeCompte != "Z" && c !== contrepartieToIgnore).map(c => +c.montantCreditBase).reduce((a,b) => a + b, 0);
    let debit = this.contreparties.filter(c => c.typeCompte != "Z" && c !== contrepartieToIgnore).map(c => +c.montantDebitBase).reduce((a,b) => a + b, 0);
    ventileCompta = ventileCompta + debit - credit;
    return ventileCompta;
  }

  private getVentileDevise(contrepartieToIgnore?: PieceComptableContrepartie): number{
    if(!this.devise || !this.journal || !this.contreparties)
      return 0;

    let ventileDevise : number = +this.montantBase;
    if(this.journal.codeMouvement == "CR")
      ventileDevise = ventileDevise * -1;
    let credit = this.contreparties.filter(c => c.typeCompte != "Z" && c.codeDevise == this.devise.id && c != contrepartieToIgnore).map(c => +c.montantCredit).reduce((a,b) => a + b, 0);
    let debit = this.contreparties.filter(c => c.typeCompte != "Z" && c.codeDevise == this.devise.id && c != contrepartieToIgnore).map(c => +c.montantDebit).reduce((a,b) => a + b, 0);
    ventileDevise = ventileDevise + debit - credit;
    return +ventileDevise.toFixed(this.devise.typeDevise == "E" ? 0 : 2);
  }

  private getTvaCalcule(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if(!this.contreparties)
      return 0;

    let montantsCaseTva : {case: number, caseTaux:number, montant: number}[] = [];
    this.contreparties.filter(c => c !== contrepartieToIgnore).forEach(element => {
      let montantCase =  montantsCaseTva.find(c => c.case == element.caseTva.numeroCase);
      if(montantCase)
        montantCase.montant += +element.montantCredit - +element.montantDebit;
      else if(element.caseTva.typeCase > 0 && element.caseTva.typeCase < 4 ){
        montantsCaseTva.push({case: element.caseTva.numeroCase, 
        caseTaux: element.caseTva.tauxTvaCase,
        montant: +element.montantCredit - +element.montantDebit});
      }
    });
    
    return +montantsCaseTva.map(c => c.montant * c.caseTaux / 100).reduce((a,b) => a + b, 0).toFixed(this.devise.typeDevise == "E" ? 0 : 2);
  }

  private getTvaImpute(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if(!this.contreparties)
      return 0;

    return this.contreparties.filter(c => (c.caseTva.typeCase == 50 || c.caseTva.typeCase == 51) && c.codeDevise == this.devise.id && c !== contrepartieToIgnore)
      .map(c => +c.montantCredit - +c.montantDebit)
      .reduce((a,b) => a + b, 0);
  }

  @Watch('contreparties')
  @Watch("montantDevise")
  private refreshMontantAVentille(){
    this.ventilleBase = Math.abs(this.getVentileBase());
    this.ventilleDevise = Math.abs(this.getVentileDevise());
  }
}
</script>

<style>
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
</style>
