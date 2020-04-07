<template>
  <v-menu
    ref="menuDate"
    v-model="menuDate"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{}">
      <v-text-field
        v-model="dateFormatted"
        :label="label"
        :prepend-icon="isReadonly ? '' : 'mdi-calendar'"
        @click:prepend="menuDate = true"
        :filled="isReadonly"
        :readonly="isReadonly"
        @blur="date = parseDate(dateFormatted)"
        hide-details
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      no-title
      @input="menuDate = false"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop, Watch } from "vue-property-decorator";
import moment from 'moment';

@Component({
  name: "DatePicker"
})
export default class extends Vue {
  private menuDate: boolean = false;
  @PropSync('readonly')
  private isReadonly!: boolean;
  @PropSync('dateSelected')
  public date!: Date;
  public dateFormatted: string = "";
  @Prop() readonly label: string | undefined;

  private parseDate(date: string) {
    if (!date) return null;

    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  @Watch("date")
  private dateChanged(val: Date, oldVal: Date) {
    this.dateFormatted = moment(val).format("DD/MM/YYYY");
  }
}
</script>
