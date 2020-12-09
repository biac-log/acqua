<template>
  <v-menu
    ref="menuDate"
    v-model="menuDate"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
    :disabled="isDisabled"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{}">
      <v-text-field
        v-model="dateFormatted"
        ref="refDate"
        :label="label"
        :readonly="isReadonly"
        :rules="dateRules"
        @blur.prevent="parseDate(dateFormatted)"
        @focus="$event.target.select()"
        :hide-details="isReadonly"
        :disabled="isDisabled"
        :tabindex="tabindex"
        :outlined="outlined"
        validate-on-blur
        @update:error="validateField"
        :error-messages="errorMessages"
      >
        <template v-slot:prepend-inner>
          <v-btn
            icon
            small
            :disabled="isReadonly"
            @click="menuDate = true"
            @keydown.enter.prevent.stop="menuDate = true"
            tabindex="-1"
          >
            <v-icon>mdi-calendar</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>
    <v-date-picker no-title v-model="dateSelected" @input="menuDate = false"></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop, Watch } from 'vue-property-decorator';
import { DateTime } from '../models/DateTime';

@Component({
  name: 'DatePicker'
})
export default class extends Vue {
  private menuDate = false;
  public dateSelected = '';
  public dateFormatted = '';

  @Prop() readonly label: string | undefined;
  @Prop() readonly tabindex: number | undefined;
  @Prop() readonly outlined!: boolean;
  @PropSync('readonly') private isReadonly!: boolean;
  @PropSync('date') public syncedDate!: DateTime | null;
  @PropSync('rules') public dateRules!: any;
  @PropSync('filled') public isFilled?: boolean;
  @PropSync('disabled', { default: false }) public isDisabled!: boolean;

  private errorMessages: string[] = [];

  private parseDate(date: string) {
    if (!date) this.dateSelected = '';
    else {
      let dateString = date;
      if (date.length < 6) {
        const dateBase = this.syncedDate ? this.syncedDate : new DateTime();
        if (date.length === 2) dateString = `${date}/${dateBase.date.format('MM/YYYY')}`;
        else if (date.length === 4) dateString = `${date}${dateBase.date.format('YYYY')}`;
        else if (date.length === 5) dateString = `${date}/${dateBase.date.format('YYYY')}`;
      } else if (date.length === 6) {
        let annee = date.slice(-2).toNumber();
        if (annee >= 80) annee += 1900;
        else annee += 2000;
        dateString = `${date.substring(0, 4)}${annee}`;
      }
      const dateToSelect = new DateTime(dateString);
      if (dateToSelect.toString('YYYY-MM-DD') == this.dateSelected) {
        this.$nextTick(() => (this.dateFormatted = dateToSelect.toString()));
      }
      this.dateSelected = dateToSelect.toString('YYYY-MM-DD');
    }
  }

  private validateField() {
    //Utilisé lors de l'erreur quand on retape la même date mais partiellement
    //Ex : 01-01-2020 par défaut on écrit 01 => erreur alors qu'il ne faut pas
    this.$nextTick(() => (this.$refs.refDate as any).validate(true));
  }

  @Watch('dateSelected', { deep: true })
  private dateSelectedChanged(val: string) {
    if (val) {
      const date = new DateTime(val);
      this.dateFormatted = date.toString();
      this.syncedDate = date;
      this.$nextTick(() => (this.$refs.refDate as any).validate(true));
    } else {
      this.dateFormatted = '';
      this.syncedDate = null;
    }
  }

  @Watch('syncedDate', { deep: true })
  private syncedDateChanged(val: DateTime | null) {
    const currentDate = new DateTime(this.dateFormatted);
    if (!val?.isValid()) this.dateSelected = '';
    else if (!val.isSame(currentDate)) this.dateSelected = val.toUtc();
  }

  public focus() {
    this.$nextTick(() => (this.$refs.refDate as any).focus());
  }

  public blur() {
    this.$nextTick(() => (this.$refs.refDate as any).blur());
  }

  public selectText() {
    this.$nextTick(() => (this.$refs.refDate as Vue).$el.querySelector('input')?.select());
  }

  public isDateValid() {
    this.parseDate(this.dateFormatted);
    if (new DateTime(this.dateSelected).isValid()) {
      this.errorMessages = [];
      return true;
    } else {
      this.errorMessages.push('Date invalide');
      this.focus();
      return false;
    }
  }
}
</script>
