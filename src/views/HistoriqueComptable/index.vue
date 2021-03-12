<template>
  <v-container fluid>
    <v-card>
      <v-form ref="form" v-model="isSearchValid">
        <v-row align="start" justify="start" class="pl-5 pr-5">
          <v-col cols="12" xs="12" sm="6" lg="2">
            <v-select
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
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang='ts'>
import CompteApi from '@/api/CompteApi';
import { TypeCompte } from '@/models/AchatVente';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
@Component({
  name: 'HistoriqueComptableIndex',
})
export default class HistoriqueComptableIndex extends Vue {
  private isSearchValid = false;
  private typesComptes: TypeCompte[] = [];
  private typeCompteSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  mounted() {
    CompteApi.getTypesComptes().then((resp) => {
      this.typesComptes = resp;
    });
  }


  private changeType(event: KeyboardEvent) {
    if (['c', 'f', 'g', 'z'].includes(event.key)) {
      if ('z' == event.key) this.typeCompteSelected = new TypeCompte({ id: 'Z', libelle: 'Extra-comptable' });
      this.$nextTick(() => (this.$refs.typesComptes as any).blur());
    //   this.$nextTick(() => this.refNumeroCompte.focus());
    }
  }
}
</script>

<style>
</style>