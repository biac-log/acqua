<template>
  <v-container fluid @keydown.107.prevent="addSociete">
    <v-card>
      <v-card-title>
        Sociétés
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addSociete">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <small class="ml-5">
          Chemin Apollo :
          <i>{{ pathApolloPlaceholder }}</i>
        </small>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }"
            ><v-btn ref="btnGenerate" color="warning" class="ml-5" v-on="on" @click.stop="generateSocietes"
              ><v-icon>mdi-playlist-plus</v-icon>Générer depuis les dossiers</v-btn
            ></template
          ><span>Générer les sociétés à partir des sous-dossiers existants</span>
          </v-tooltip
        >
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
          autofocus
          ref="searchFocus"
          id="indexSearch"
          outlined
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="items"
        :search="search"
        :loading="isLoading"
        :options.sync="options"
        @click:row="openSociete"
      >
      </v-data-table>
    </v-card>
    <societe-vue ref="societeDialog" />
    <generate-societes ref="generateSocietesDialog" />
  </v-container>
</template>

<script lang="ts">
import { SocieteModule } from '@/store/modules/companies';
import { Component, Vue, Ref } from 'vue-property-decorator';
import SocieteVue from '@/views/Societes/components/Societe.vue';
import GenerateSocietes from '@/views/Societes/components/GenerateSocietes.vue';
import { Societe } from '@/models/Societe/societe';
import { ApplicationModule } from '@/store/modules/application';

@Component({
  name: 'Societes',
  components: { SocieteVue, GenerateSocietes },
})
export default class Societes extends Vue {
  @Ref() private societeDialog!: SocieteVue;
  @Ref() private generateSocietesDialog!: GenerateSocietes;

  private search = '';
  private options: any = {};
  private isLoading = false;
  private headers = [
    { text: 'Nom', value: 'name' },
    { text: 'Identifiant', value: 'identifiant' },
    { text: 'Synchronisé le', value: 'syncedAtFormatted' },
  ];
  private pathApolloPlaceholder = ApplicationModule.parametre.pathApolloPlaceholder.replace('\\{path}', '');

  private addSociete() {
    this.societeDialog.openNew();
  }

  private async openSociete(societe: Societe) {
    this.societeDialog.open(societe);
  }

  private async generateSocietes() {
    this.generateSocietesDialog.open();
  }

  private get items() {
    return SocieteModule.societes;
  }
}
</script>

<style>
</style>