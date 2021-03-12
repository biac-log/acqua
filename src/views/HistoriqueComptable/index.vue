<template>
  <v-container fluid>
    <v-card>
      <v-form ref="form" v-model="isSearchValid">
        <v-row align="start" justify="start" class="pl-5">
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
              @change="resetCompte"
            />
          </v-col>
          <v-col lg="3" class="pl-5">
            <AutocompleteComptesVue
              ref="compteComponent"
              :typeCompte.sync="typeCompteSelected.id"
              label="Compte"
              outlined
              :disabled="!typeCompteSelected.id"
              @change="compteChange"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang='ts'>
import CompteApi from '@/api/CompteApi';
import { TypeCompte } from '@/models/Compte/TypeCompte';
import { Component, Vue, Watch, Ref } from 'vue-property-decorator';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import { CaseTva } from '@/models/CaseTva';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
@Component({
  name: 'HistoriqueComptableIndex',
  components: { AutocompleteComptesVue },
})
export default class HistoriqueComptableIndex extends Vue {
  @Ref() private compteComponent!: AutocompleteComptesVue;

  private isSearchValid = false;
  private typesComptes: TypeCompte[] = [];
  private typeCompteSelected: TypeCompte = new TypeCompte();
  private typesComptesRules: any = [(v: string) => !!v || 'Type obligatoire'];

  private numeroCompte = '';

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
    } else if (
      compte instanceof CompteGeneralSearch ||
      compte instanceof CompteSearch ||
      compte instanceof CompteDeTier
    ) {
      this.numeroCompte = compte.numero.toString();
    }
  }

  private resetCompte() {
      this.compteComponent.resetCompte();
      this.numeroCompte = '';
  }
}
</script>

<style>
</style>