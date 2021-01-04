<template>
  <v-container fluid @keydown.107.prevent="addSociete">
    <v-card>
      <v-card-title>
        Sociétés
        <v-btn ref="btnAdd" color="warning" small fab class="ml-5" @click.stop="addSociete">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
    <!-- <FournisseurVue ref="fournisseurDialog" /> -->
  </v-container>
</template>

<script lang="ts">
import { SocieteModule } from '@/store/modules/companies';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'Societes',
})
export default class Societes extends Vue {
  private search = '';
  private options: any = {};
  private isLoading = false;
  private headers = [
    { text: 'Nom', value: 'name' },
    { text: 'Slug', value: 'slug' },
  ];

  private addSociete() {
    console.log('add');
  }

  private openSociete() {
    console.log('open')
  }

  private get items() {
    return SocieteModule.societes;
  }
}
</script>

<style>
</style>