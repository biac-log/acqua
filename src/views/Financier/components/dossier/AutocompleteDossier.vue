<template>
  <span>
    <v-combobox
      ref="dossierComponent"
      label="N° Dossier"
      v-model="dossierSelected"
      :items="dossiersSearch"
      :search-input.sync="searchDossier"
      :rules="idDossierRules"
      @keyup.enter="$event.target.select()"
      @focus="$event.target.select()"
      @change="dossierChangeAsync"
      @keydown.ctrl.f.prevent="OpenSearchDossier()"
      :hide-details="disabled"
      :readonly="disabled"
      :disabled="disabled"
      validate-on-blur
      hide-selected
      item-text="idNom"
      item-value="idDossier"
      hide-no-data
      dense
      >
      <template v-slot:append>
        <v-tooltip top open-delay=500>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              :disabled="disabled"
              @click="OpenSearchDossier()"
              @keydown.enter.prevent.stop="OpenSearchDossier()"
              v-on="on">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <span>Recherche de dossier<span class="shortcutTooltip">ctrl + f</span></span>
        </v-tooltip>
      </template>
      <template v-slot:selection="{ item }">
        {{ item.idDossier }}
      </template>
      <template v-slot:item="{ item }">
        {{ item.idNom }}
      </template>
      </v-combobox>
      <SearchDossierVue ref="searchDossierDialog"></SearchDossierVue>
  </span>
</template>

<script lang="ts">
  import { Component, Vue, Watch, Ref, PropSync, Prop } from "vue-property-decorator";
  import { DossierSearch } from '@/models/Dossier/DossierSearch';
  import { DossierApi } from '@/api/DossierApi';
  import SearchDossierVue from '@/components/search/SearchDossier.vue';

  @Component({components: {SearchDossierVue}})
  export default class AutoCompleteDossierVue extends Vue {
    @Ref() readonly searchDossierDialog!: SearchDossierVue;
    @Ref() readonly dossierComponent!: HTMLInputElement;

    @PropSync('disabled', { type: Boolean } ) isDisabled!: boolean;
    @Prop() required!: boolean;

    private dossierLoading: boolean = false;
    private idDossier: string = "";
    private dossiersSearch: DossierSearch[] = [];
    private searchDossier: string = "";
    private idDossierRules: any = [
      (v: any) => this.validateDossier(v)
    ];
    private validateDossier(value: string | DossierSearch): boolean | string{
      if(this.isDisabled || !this.required)
        return true;
      if(value instanceof DossierSearch && !value.idDossier && !this.isDisabled && this.required)
        return "Dossier obligatoire";
      else if(!!value && !this.isDisabled && this.required)
        return "Dossier obligatoire";
      else if(value && !this.nomDossier){
        return "Dossier invalide";
      } else return true;
    }
    private dossierSelected: DossierSearch = new DossierSearch();
    private nomDossier: string = "";

    @Watch("searchDossier")
    private async autocompleteDossiers(matchCode: string) {
      try {
        this.dossierLoading = true;
        if (matchCode) {
          this.dossiersSearch = await DossierApi.getsById(matchCode.toUpperCase(), 5);
        } else this.dossiersSearch = [];
      } catch (err) {
        console.log(err);
      } finally {
        this.dossierLoading = false;
      }
    }

    private OpenSearchDossier(): void {
      this.searchDossierDialog.open()
        .then(dossier => {
          this.setDossier(dossier);
          this.$nextTick(() => (this.$refs.montant as any)?.focus());
        }).catch(() => {
          this.$nextTick(() => (this.$refs.dossier as any)?.focus());
        });
    }

    private async dossierChangeAsync(value: string | DossierSearch | undefined) {
      if(!value) this.resetDossier();
      else if(typeof value === "string"){
        this.dossierLoading = true;
        let dossier = await DossierApi.getById(value)
        this.setDossier(dossier);
        this.dossierLoading = false;
      } 
      else  this.setDossier(value);
    }

    public setDossier(dossier: DossierSearch) {
      if (dossier) {
        this.dossiersSearch = [];
        this.dossiersSearch.push(dossier);
        this.dossierSelected = dossier;
      }

      this.idDossier = dossier.idDossier.toString();
      this.nomDossier = dossier.nom;
      this.$emit("Change", dossier);
    }

    public resetDossier(){
      this.dossierSelected = new DossierSearch();
      this.searchDossier = "";
      this.idDossier = "";
      this.nomDossier = "";
    }

    public focus(){
      this.$nextTick(() => this.dossierComponent.focus());
    }

    public blur(){
      this.$nextTick(() => (this.$refs.numeroCompte as any)?.blur());
    }
  }
</script>

<style scoped>

</style>