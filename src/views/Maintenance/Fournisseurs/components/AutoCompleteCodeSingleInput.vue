<template>
  <div class="autocompleteCode">
      <!-- rules -->
      <!-- loading -->
      <!-- error-message -->
      <!-- validate-on-blur -->
      <!-- no-filter -->
      
    <v-combobox
      ref="comboboxCode"
      :label="label"
      :readonly="isReadonly"
      :filled="isReadonly"
      @change="codeChange"
      :search-input.sync="searchCode"
      :items="items"
      hide-selected
      item-text="numeroNom"
      item-value="code"
      hide-no-data
      @keyup.enter="$event.target.select()"
      @focus="$event.target.select(),clearContentOnFocus()"
      @blur="restoreContentOnBlur()"
      @keydown.ctrl.f.prevent="openSearch()"
      @keydown.f5.prevent="openSearch()"
      v-model="codeSelected"
      :hide-details="hideDetails"
      outlined
    >
      <template v-slot:append>
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-show="!readonly"
              :disabled="readonly"
              @click="openSearch()"
              @keydown.enter.prevent.stop="openSearch()"
              tabindex="-1"
              v-on="on"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
          <span>Recherche<span class="shortcutTooltip">ctrl + f</span></span>
        </v-tooltip>
      </template>
      <template v-slot:item="{ item }"> {{ item.numeroNom }}</template>
    </v-combobox>
    <search-code ref="searchModal" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch, Prop, PropSync } from 'vue-property-decorator';
import RepresentantApi from '@/api/RepresentantApi';
import FamilleApi from '@/api/FamilleApi';
import SecteurApi from '@/api/SecteurApi';
import SearchCode from '@/views/Maintenance/Fournisseurs/components/SearchCode.vue';
import { CodeItem } from '@/models/CodeItem';

@Component({
  name: 'AutocompleteCodeSingleInputVue',
  components: { SearchCode }
})
export default class AutocompleteCodeSingleInputVue extends Vue {
  @Prop() readonly label!: string;
  @PropSync('readonly') readonly isReadonly!: boolean;
  @Prop() private typeCode!: string;
  @Prop({ default: true }) hideDetails!: boolean;

  @Ref() private searchModal!: SearchCode;
  @Ref() private comboboxCode!: any;

//this is rendered (only the numeric part)
  private codeSelected: CodeItem = new CodeItem(0, '');
  private items: CodeItem[] = [];
  private searchCode = '';
  private previousCode: CodeItem = new CodeItem(0,'');

  public init(value: string) {
    this.codeSelected = new CodeItem(value, '');
  }


  private async codeChange(value: CodeItem) {
    this.codeSelected = value;
    this.$emit('select', this.codeSelected);
  }

  /*w.o. this method, the default behavior visually append the freshly inputed value to the already existing value.
  So, this method clean the existing value and store it in a temp attribute to use with restoreContentOnBlur() method*/
  private clearContentOnFocus(){
    if(!this.isReadonly)
    {
      this.previousCode = this.codeSelected;
      this.codeSelected = new CodeItem(0, '');
    }
  }
  private restoreContentOnBlur(){
    //If codeSelected changed, we don't want to restore the previous code valuenpm 
    if(this.codeSelected.code && this.codeSelected.nom)
      return;
    if(this.previousCode.code && this.previousCode.nom){
      this.codeSelected = this.previousCode;
    }
  }
  public resetValue(){
    this.codeSelected = new CodeItem(0,'');
    this.previousCode = new CodeItem(0,'');
    this.searchCode='';
  }

  @Watch('searchCode')
  private async watchSearchCode() {
    if (this.searchCode == '' || this.searchCode == null) {
      this.items = [];
    } else {
      if (this.typeCode == 'codeRepresentant') {
        const representants = await RepresentantApi.searchRepresentantsByCode(parseInt(this.searchCode), 5);
        this.items = representants.map((r) => new CodeItem(r.code, r.nom));
      } else if (this.typeCode == 'codeFamille') {
        const familles = await FamilleApi.searchFamillesByCode(parseInt(this.searchCode), 5, 'F');
        this.items = familles.map((r) => new CodeItem(r.famille, r.libelleF));
      } else if (this.typeCode == 'codeSecteur') {
        const secteurs = await SecteurApi.searchSecteursByCode(parseInt(this.searchCode), 5);
        this.items = secteurs.map((r) => new CodeItem(r.codeSecteur, r.nom));
      }
    }
  }

  private openSearch() {
    this.searchModal.open(this.typeCode).then((value: CodeItem) => {
      this.codeSelected = value;
      this.$emit('select', value);
    });
  }

  public focus() {
    this.$nextTick(() => this.comboboxCode?.focus());
  }
}
</script>

<style></style>
