<template>
  <v-container class="ma-0 pa-0">
    <v-card class="mb-3">
      <v-card-title class="pa-3">
        Contreparties
        <v-tooltip open-delay="500" top>
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              fab
              x-small
              class="ml-5"
              ref="btnAdd"
              :disabled="readonly || !nomCompteDeTier"
              @click.stop="createContrepartie"
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Ajouter une contrepartie <span class="shortcutTooltip">+</span></span>
        </v-tooltip>
        <v-spacer></v-spacer>
        <span :class="!ventilleBase || ventilleBase == 0 ? 'equilibre' : 'notEquilibre'">
          <span v-if="!devise || devise.id == 1"
            >Montant à ventiler :
            <b>{{ ventilleDevise | numberToStringEvenZero }} {{ devise ? devise.libelle : 'EUR' }}</b></span
          >
          <span v-if="devise && devise.id != 1">
            Ventiler devise :
            <b>{{ ventilleDevise | numberToStringEvenZero }} {{ devise ? devise.libelle : 'EUR' }}</b> - Ventiler base :
            <b>{{ ventilleBase | numberToStringEvenZero }} EUR</b></span
          >
        </span>
      </v-card-title>
      <v-data-table
        :headers="headersContreparties"
        :items="contreparties"
        id="dataTable"
        class="elevation-1"
        :dense="contreparties && contreparties.length > 8"
        disable-pagination
        hide-default-footer
        @click:row="editContrepartie"
        height="350px"
      >
      </v-data-table>
    </v-card>
    <EditContrepartieVue
      ref="editContrepartie"
      :isReadOnly.sync="readonly"
      :DatePiece.sync="datePiece"
      :TauxDevise.sync="tauxDevise"
    ></EditContrepartieVue>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { PieceComptableContrepartie, Journal } from '@/models/AchatVente';
import EditContrepartieVue from './EditContrepartie.vue';
import { Devise } from '@/models/Devise/Devise';
import { DateTime } from '@/models/DateTime';
import CaseTvaApi from '@/api/CaseTvaApi';
import CompteApi from '@/api/CompteApi';
import AchatVenteApi from '@/api/AchatVenteApi';

@Component({
  name: 'GridContreparties',
  components: { EditContrepartieVue }
})
export default class extends Vue {
  @PropSync('IsReadOnly') public readonly!: boolean;
  @PropSync('Contreparties') private contreparties!: PieceComptableContrepartie[];
  @PropSync('Journal') public journal!: Journal;
  @PropSync('DeviseEntete') public devise!: Devise;
  @PropSync('CompteAchatVente') private numeroCompteAchatVente!: number;
  @PropSync('MontantDevise') private montantDevise!: string;
  @PropSync('MontantBase') private montantBase!: string;
  @PropSync('NomCompteDeTier') private nomCompteDeTier!: string;
  @PropSync('CodeTaxe') private codeTaxe!: number;
  @PropSync('TauxDevise') private tauxDevise!: string;
  @PropSync('DatePiece') private datePiece!: DateTime;
  private overlay = false;

  private ventilleBase = 0;
  public ventilleDevise = 0;
  public propositionLibelle = '';

  private headersContreparties = [
    { text: 'N° Compte', value: 'libelleNumero' },
    { text: 'Nom compte', value: 'compteLibelle' },
    { text: 'Libelle', value: 'libelle' },
    { text: 'Débit', value: 'montantDebit', align: 'end' },
    { text: 'Crédit', value: 'montantCredit', align: 'end' },
    { text: 'Devise', value: 'libelleDevise' },
    { text: 'Case TVA', value: 'libelleCaseTva' }
  ];

  private addContrepartie(contrepartie?: PieceComptableContrepartie) {
    this.overlay = true;
    (this.$refs.editContrepartie as EditContrepartieVue)
      .openNew(
        this.journal.numero,
        this.devise,
        this.getVentileDevise(),
        this.getTvaCalcule(),
        this.getTvaImpute(),
        this.propositionLibelle,
        contrepartie
      )
      .then((resp: PieceComptableContrepartie) => {
        this.propositionLibelle = resp.libelle;
        const maxLigne = Math.max(...this.contreparties.map((i) => i.numeroLigne));
        resp.numeroLigne = maxLigne + 1;
        this.contreparties.push(resp);
        this.$nextTick(() => {
          if (this.ventilleBase != 0 || this.ventilleDevise != 0) this.createContrepartie();
        });
      })
      .finally(() => {
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  private editContrepartie(piece: PieceComptableContrepartie) {
    this.overlay = true;
    (this.$refs.editContrepartie as EditContrepartieVue)
      .open(
        piece,
        this.journal.numero,
        this.devise,
        this.getVentileDevise(piece),
        this.getTvaCalcule(piece),
        this.getTvaImpute(piece)
      )
      .then((resp: PieceComptableContrepartie) => {
        if (resp) {
          const contrepartie = this.contreparties.find((d) => d == piece);
          if (contrepartie)
            Vue.set(
              this.contreparties,
              this.contreparties.findIndex((d) => d == piece),
              resp
            );
          else this.contreparties.push(resp);
        } else this.contreparties.splice(this.contreparties.indexOf(piece), 1);
      })
      .finally(() => {
        this.refreshMontantAVentille();
        this.$nextTick(() => (this.$refs.btnAdd as any)?.$el?.focus());
      });
  }

  public async createContrepartie() {
    if (!this.numeroCompteAchatVente && this.contreparties.length == 0) {
      this.propositionLibelle = this.nomCompteDeTier;
      this.addContrepartie();
    } else if (this.contreparties.length == 0) { // Première contrepartie
      const compteAchatVente = await CompteApi.getCompteGeneral('G', this.numeroCompteAchatVente);
      const contrepartie = new PieceComptableContrepartie();
      contrepartie.numeroCompte = compteAchatVente.numero;
      contrepartie.compteLibelle = compteAchatVente.nom;
      contrepartie.libelle = this.nomCompteDeTier;
      console.log(this.journal.codeMouvement);
      if(this.montantBase.toNumber() >= 0){
        contrepartie.codeMouvement = this.journal.codeMouvement == 'DB' ? 'CR' : 'DB';
      }else{
        contrepartie.codeMouvement = this.journal.codeMouvement == 'CR' ? 'CR' : 'DB';
      }
      if (compteAchatVente.numeroCase) {
        const tva = await CaseTvaApi.getCaseTVA(compteAchatVente.numeroCase, this.journal.numero);
        if (tva) {
          contrepartie.montantDevise = Math.abs(this.montantDevise.toNumber()) / (1 + tva.tauxTvaCase / 100);
          contrepartie.montantBase = Math.abs(this.montantBase.toNumber()) / (1 + tva.tauxTvaCase / 100);
          contrepartie.caseTva = tva;
        }
      }
      this.addContrepartie(contrepartie);
    } else if (this.ventilleDevise == 0 && this.ventilleBase != 0) { // Si le ventileBase n'est pas à 0, généralement à cause du taux de conversion
      const contrepartie = new PieceComptableContrepartie();
      contrepartie.libelle = this.nomCompteDeTier;
      contrepartie.codeMouvement = this.journal.codeMouvement == 'DB' ? 'DB' : 'CR';
      contrepartie.montantDevise = 0;
      contrepartie.montantBase = this.ventilleBase;
      contrepartie.codeDevise = 1;
      if (this.numeroCompteAchatVente) {
        const compteAchatVente = await CompteApi.getCompteGeneral('G', this.numeroCompteAchatVente);
        if (compteAchatVente.numeroCase) {
          const tva = await CaseTvaApi.getCaseTVA(compteAchatVente?.numeroCase, this.journal.numero);
          contrepartie.numeroCompte = compteAchatVente.numero;
          contrepartie.compteLibelle = compteAchatVente.nom;
          contrepartie.caseTva = tva;
        }
      }
      this.addContrepartie(contrepartie);
    } else {
      const ventileDevise = this.getVentileDevise();
      const tvaCalcule = this.getTvaCalcule();
      const tvaImpute = this.getTvaImpute();
      if (ventileDevise == tvaCalcule - tvaImpute) {
        const contrepartie = await this.getContrepartieTVA(tvaCalcule, tvaImpute);
        this.addContrepartie(contrepartie);
      } else this.addContrepartie();
    }
  }

  public async getContrepartieTVA(tvaCalcule?: number, tvaImpute?: number): Promise<PieceComptableContrepartie> {
    if (!tvaCalcule) tvaCalcule = this.getTvaCalcule();
    if (!tvaImpute) tvaImpute = this.getTvaImpute();
    const codepays = this.contreparties.find((ctr) => ['BX', 'VX', 'FX', 'IX'].indexOf(ctr.caseTva.natureCase))?.caseTva
      .codePays;
    const compteTva = await AchatVenteApi.getCompteTva(this.journal.numero, this.codeTaxe, codepays);
    const tva = await CaseTvaApi.getCaseTVA(compteTva.numeroCase, this.journal.numero);
    const contrepartie = new PieceComptableContrepartie();
    contrepartie.numeroCompte = compteTva.numero;
    contrepartie.compteLibelle = compteTva.nom;
    contrepartie.libelle = this.nomCompteDeTier;
    if(this.montantBase.toNumber() >= 0){
      contrepartie.codeMouvement = this.journal.codeMouvement == 'DB' ? 'CR' : 'DB';
    }else{
      contrepartie.codeMouvement = this.journal.codeMouvement == 'CR' ? 'CR' : 'DB';
    }
    contrepartie.montantDevise = Math.abs(tvaCalcule - tvaImpute);
    contrepartie.montantBase = Math.abs((tvaCalcule - tvaImpute) * +this.tauxDevise);
    contrepartie.caseTva = tva;
    return contrepartie;
  }

  private getVentileBase(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if (!this.contreparties || !this.journal) return 0;

    let ventileCompta: number = this.montantBase.toNumber();
    if (this.journal.codeMouvement == 'CR') ventileCompta = ventileCompta * -1;

    const credit = this.contreparties
      .filter((c) => c.typeCompte != 'Z' && c != contrepartieToIgnore)
      .map((c) => c.montantCreditBase.toNumber())
      .reduce((a, b) => a + b, 0);
    const debit = this.contreparties
      .filter((c) => c.typeCompte != 'Z' && c != contrepartieToIgnore)
      .map((c) => c.montantDebitBase.toNumber())
      .reduce((a, b) => a + b, 0);
    ventileCompta = ventileCompta + debit - credit;
    return ventileCompta.toDecimalString(2).toNumber();
  }

  public getVentileDevise(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if (!this.devise || !this.journal || !this.contreparties) return 0;

    let ventileDevise: number = this.montantDevise.toNumber();
    if (this.journal.codeMouvement == 'CR') ventileDevise = ventileDevise * -1;

    const credit = this.contreparties
      .filter((c) => c.typeCompte != 'Z' && c.codeDevise == this.devise.id && c != contrepartieToIgnore)
      .map((c) => c.montantCredit.toNumber())
      .reduce((a, b) => a + b, 0);
    const debit = this.contreparties
      .filter((c) => c.typeCompte != 'Z' && c.codeDevise == this.devise.id && c != contrepartieToIgnore)
      .map((c) => c.montantDebit.toNumber())
      .reduce((a, b) => a + b, 0);
    ventileDevise = ventileDevise + debit - credit;
    return ventileDevise.toDecimalString(this.devise.typeDevise == 'E' ? 0 : 2).toNumber();
  }

  public getTvaCalcule(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if (!this.contreparties) return 0;

    const montantsCaseTva: { case: number; caseTaux: number; montant: number }[] = [];
    this.contreparties
      .filter((c) => c !== contrepartieToIgnore)
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
      .toDecimalString(this.devise.typeDevise == 'E' ? 0 : 2)
      .toNumber();
  }

  public getTvaImpute(contrepartieToIgnore?: PieceComptableContrepartie): number {
    if (!this.contreparties) return 0;

    return this.contreparties
      .filter(
        (c) =>
          (c.caseTva.typeCase == 50 || c.caseTva.typeCase == 51) &&
          c.codeDevise == this.devise.id &&
          c !== contrepartieToIgnore
      )
      .map((c) => c.montantCredit.toNumber() - c.montantDebit.toNumber())
      .reduce((a, b) => a + b, 0);
  }

  public errorInTVA(): boolean {
    return this.getTvaCalcule() != this.getTvaImpute();
  }

  public pieceIsEquilibre(): boolean {
    return this.ventilleBase == 0 && this.ventilleDevise == 0;
  }

  @Watch('contreparties')
  @Watch('montantDevise')
  private refreshMontantAVentille() {
    this.ventilleBase = Math.abs(this.getVentileBase());
    this.ventilleDevise = Math.abs(this.getVentileDevise());
  }
}
</script>

<style scoped>
#btn-acqua {
  height: 56px;
}

#dataTable tbody tr {
  cursor: pointer;
}

.notEquilibre {
  color: red;
  margin-left: 10px;
}

.equilibre {
  color: green;
  margin-left: 10px;
}
</style>
