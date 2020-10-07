<template>
  <v-form ref="form" v-model="isValid" lazy-validation> </v-form>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch, Ref } from 'vue-property-decorator';
import { Imputation, Journal } from '@/models/OperationDiverse';
import OperationDiverseApi from '@/api/OperationDiverseApi';
import { DateTime } from '@/models/DateTime';
import DeviseApi from '@/api/DeviseApi';

@Component({})
export default class ImputationVue extends Vue {
  private ventileBase = 0;
  private ventileDevise = 0;

  private resolve: any;
  private reject: any;

  public open(journal: Journal, numeroPiece: string, extrait: Imputation): Promise<Imputation> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public openNew(journal: Journal): Promise<Imputation> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
</script>

<style scoped>
.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-bottom: 0px;
}

.notEquilibre {
  color: red;
  margin-left: 10px;
}

.equilibre {
  color: green;
  margin-left: 10px;
}

#editContrepartie {
  z-index: 999;
}
</style>
