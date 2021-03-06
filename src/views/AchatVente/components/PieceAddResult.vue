<template>
  <v-dialog
    v-model="dialog"
    width="420"
    @keypress.enter="sendResponse()"
    @click:outside="sendResponse()"
    @keydown.esc="sendResponse()"
  >
    <v-card class="pa-3 pb-0 ma-0">
      <v-card-title class="pa-0 ma-0">
        <v-spacer></v-spacer>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-checkbox label="Ne plus afficher" v-model="skipDialog" v-on="on" class="pa-0 ma-0"></v-checkbox>
          </template>
          <span>Ce message ne sera plus affiché jusqu'au prochain lancement du programme.</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text class="pa-0 ma-0">
        <v-row justify="center">
          <v-icon x-large color="success" class="justify-end" style="font-size: 100px">mdi-check-circle-outline</v-icon>
        </v-row>
        <v-row justify="center" class="mb-5">
          <h1>Ajout réussi !</h1>
        </v-row>
        <v-row justify="center">
          <h3>
            Le numéro de pièce créée est le <b>{{ journal }}.{{ numero }}</b>
          </h3>
        </v-row>
      </v-card-text>
      <v-card-actions class="mt-4 pa-0">
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-row align="center" justify="center">
                <v-btn outlined tile color="#E65100" class="mr-3" @click="changeNumeroDialog = true"
                  >Modifier le numéro</v-btn
                >
                <v-btn tile ref="btnClose" @click="sendResponse()" color="primary">
                  <v-icon>mdi-close</v-icon>
                  Fermer
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-alert prominent type="error" v-if="errorMessage" class="mb-n2 mr-n2 ml-n2">
                {{ errorMessage }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="changeNumeroDialog" width="400" @keypress.enter="saveNewNumero()" :persistent="numeroLoading">
      <v-form ref="form" v-model="isValid">
        <v-card class="pa-5 ma-0">
          <v-card-title>
            Modification du numéro de pièce
          </v-card-title>
          <v-card-text class="ma-0 mt-5 pb-2">
            <v-text-field
              ref="numero"
              label="Nouveau numéro"
              v-model="nouveauNumero"
              :rules="nouveauNumeroRules"
              :readonly="numeroLoading"
              outlined
              autofocus
              counter="6"
            >
            </v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-btn
                outlined
                tile
                tabindex="-1"
                color="primary"
                class="mr-3"
                @click="changeNumeroDialog = false"
                :disabled="numeroLoading"
              >
                <v-icon left>mdi-close</v-icon> Fermer
              </v-btn>
              <v-btn
                tile
                ref="btn"
                @click="saveNewNumero()"
                color="success"
                :loading="numeroLoading"
                :disabled="!isValid"
              >
                <v-icon left>mdi-content-save</v-icon> Sauvegarder
              </v-btn>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import AchatVenteApi from '@/api/AchatVenteApi';
import { displayAxiosError } from '@/utils/ErrorMethods';

@Component({
  name: 'PieceAddResult'
})
export default class extends Vue {
  private dialog = false;
  @PropSync('SkipDialog')
  private skipDialog!: boolean;
  private numero = 0;
  private periode = '';
  private journal = 0;
  private nouveauNumero = '';
  private nouveauNumeroRules: any = [
    (v: string) => !!v || 'Numéro obligatoire',
    (v: string) => (!!v.toNumber() && v.length == 6) || 'Numéro invalide'
  ];

  private numeroLoading = false;
  private errorMessage = '';
  private changeNumeroDialog = false;

  private isValid = true;

  private resolve: any;
  private reject: any;

  public open(journal: number, numero: number, periode: string): Promise<number> {
    setTimeout(() => {
      (this.$refs.btnClose as any).$el.focus();
    });
    this.errorMessage = '';
    this.journal = journal;
    this.numero = numero;
    this.periode = periode;
    this.nouveauNumero = numero.toString();
    this.dialog = true;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private saveNewNumero() {
    this.numeroLoading = true;
    AchatVenteApi.changeNumero(this.periode, this.journal, this.numero, this.nouveauNumero.toNumber())
      .then(() => {
        this.numero = this.nouveauNumero.toNumber();
        this.$nextTick(() => (this.$refs.btnClose as any)?.$el?.focus());
      })
      .catch((err: any) => {
        this.errorMessage = displayAxiosError(err);
      })
      .finally(() => {
        this.changeNumeroDialog = false;
        this.numeroLoading = false;
      });
  }

  private sendResponse() {
    this.dialog = false;
    this.resolve(this.numero);
  }
}
</script>

<style scoped>
.message {
  font-size: 18px;
}

.message >>> b {
  font-size: 20px;
}
</style>
