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
        :filled="isFilled"
        :readonly="isReadonly"
        :rules="dateRules"
        @blur.prevent="dateSelected = parseDate(dateFormatted)"
        @focus="$event.target.select()"
        :hide-details="isReadonly"
        :disabled="isDisabled"
        validate-on-blur
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

  @Prop()
  readonly label: string | undefined;
  @PropSync('readonly') private isReadonly!: boolean;
  @PropSync('date') public syncedDate!: DateTime | null;
  @PropSync('rules') public dateRules!: any;
  @PropSync('filled') public isFilled?: boolean;
  @PropSync('disabled', { default: false }) public isDisabled!: boolean;

  private parseDate(date: string): string {
    if (!date) return '';
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
      if (dateToSelect.toString('YYYY-MM-DD') == this.dateSelected)
        this.$nextTick(() => (this.dateFormatted = dateToSelect.toString()));
      return dateToSelect.toString('YYYY-MM-DD');
    }
  }

  @Watch('dateSelected')
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

  @Watch('syncedDate')
  private syncedDateChanged(val: DateTime | null) {
    const currentDate = new DateTime(this.dateFormatted);
    if (!val?.isValid()) this.dateSelected = '';
    else if (!val.isSame(currentDate)) this.dateSelected = val.toUtc();
  }

  public focus() {
    this.$nextTick(() => (this.$refs.refDate as any).focus());
  }
}
</script>
