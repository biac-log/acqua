<template>
  <span>
    <v-combobox
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
      @focus="$event.target.select()"
      v-model="codeSelected"
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
      <template v-slot:selection="{ item }">
        {{ item.code }}
      </template>
      <template v-slot:item="{ item }">
        {{ item.numeroNom }}
      </template>
    </v-combobox>
    <search-code ref="searchModal" />
  </span>
</template>

<script lang="ts">
import { Component, Vue, Ref, Watch, Prop, PropSync } from 'vue-property-decorator';
import RepresentantApi from '@/api/RepresentantApi';
import FamilleApi from '@/api/FamilleApi';
import SearchCode from '@/views/Maintenance/Fournisseurs/components/SearchCode.vue';
import { CodeItem } from '@/models/CodeItem';

@Component({
  name: 'AutocompleteCodeVue',
  components: { SearchCode }
})
export default class AutocompleteCodeVue extends Vue {
  @Prop() readonly label!: string;
  @PropSync('readonly') readonly isReadonly!: boolean;
  @Prop() private typeCode!: string;

  @Ref() private searchModal!: SearchCode;

  private codeSelected: CodeItem = new CodeItem(0, '');
  private items: CodeItem[] = [];
  private searchCode = '';

  public init(value: string) {
    this.codeSelected = new CodeItem(value, "");
  }

  private async codeChange(value: CodeItem) {
    this.codeSelected = value;
    this.$emit('select', value);
  }

  @Watch('searchCode')
  private async watchSearchCode() {
    if (this.searchCode == '' || this.searchCode == null) {
      this.items = [];
    } else {
      if (this.typeCode == 'codeRepresentant') {
        const representants = await RepresentantApi.searchRepresentantsByCode(parseInt(this.searchCode), 5);
        this.items = representants.map((r) => new CodeItem(r.code, r.nom));
      }else if (this.typeCode == 'codeFamille'){
        const familles = await FamilleApi.searchFamillesByCode(parseInt(this.searchCode), 5, 'F');
        this.items = familles.map((r) => new CodeItem(r.famille, r.libelleF));
      }
    }
  }

  private openSearch() {
    this.searchModal.open(this.typeCode).then((value: CodeItem) => {
      this.codeSelected = value;
      this.$emit('select', value);
    });
  }
}
</script>

<style>
</style>