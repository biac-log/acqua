<template>
  <v-card>
    <v-card-title>
      Contreparties
      <EditContrepartieVue
        ref="editContrepartie"
        :isReadOnly.sync="readonly"
      ></EditContrepartieVue>
    </v-card-title>
    <v-data-table
      :headers="headersContreparties"
      :items="contreparties"
      :items-per-page="10"
      id="dataTable"
      class="elevation-1"
      dense
      @click:row="editContrepartie"
    >
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop } from "vue-property-decorator";
import PieceComptableContrepartie from "@/models/AchatVente/PieceComptableContrepartie";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import axios from "axios";
import EditContrepartieVue from "./EditContrepartie.vue";

@Component({
  name: "GridContreparties",
  components: { EditContrepartieVue }
})
export default class extends Vue {
  @PropSync("isReadOnly")
  public readonly!: boolean;
  @PropSync("Contreparties")
  private contreparties!: PieceComptableContrepartie[];

  private headersContreparties = [
    { text: "N° Compte", value: "libelleNumero" },
    { text: "Nom compte", value: "compteLibelle" },
    { text: "Libelle", value: "libelle" },
    { text: "Débit", value: "montantDebit", align: "end" },
    { text: "Crédit", value: "montantCredit", align: "end" },
    { text: "Devise", value: "libelleDevise" },
    { text: "Case TVA", value: "libelleCaseTva" }
  ];

  private addContrepartie() {
    (this.$refs.editContrepartie as EditContrepartieVue)
      .open(new PieceComptableContrepartie())
      .then((resp: PieceComptableContrepartie) => {});
  }
  private editContrepartie(compte: PieceComptableContrepartie) {
    (this.$refs.editContrepartie as EditContrepartieVue)
      .open(compte)
      .then((resp: PieceComptableContrepartie) => {});
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
</style>
