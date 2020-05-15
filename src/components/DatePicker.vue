<template>
  <v-menu
    ref="menuDate"
    v-model="menuDate"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
    :close-on-content-click="false"
  >
    <template v-slot:activator="{}">
      <v-text-field
        v-model="dateFormatted"
        ref="refDate"
        :label="label"
        :prepend-icon="isReadonly ? '' : 'mdi-calendar'"
        :filled="isReadonly"
        :readonly="isReadonly"
        :rules="dateRules"
        @click:prepend="menuDate = true"
        @blur="dateSelected = parseDate(dateFormatted)"
        @focus="$event.target.select()"
        :hide-details="isReadonly"
        validate-on-blur
      ></v-text-field>
    </template>
    <v-date-picker
      no-title
      v-model="dateSelected"
      @input="menuDate = false"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop, Watch } from "vue-property-decorator";
import moment from "moment";
import { DateTime } from "../models/DateTime";

@Component({
  name: "DatePicker"
})
export default class extends Vue {
  private menuDate: boolean = false;
  public dateSelected: string = "";
  public dateFormatted: string = "";

  @Prop()
  readonly label: string | undefined;
  @PropSync("readonly")
  private isReadonly!: boolean;
  @PropSync("date")
  public syncedDate!: DateTime;
  @PropSync("rules")
  public dateRules!: any;

  private parseDate(date: string): string {
    if (!date) return "";
    else {
      return new DateTime(date).toString("YYYY-MM-DD")
    }
  }

  @Watch("dateSelected")
  private dateSelectedChanged(val: string, oldVal: string) {
    if (val) {
      let date = new DateTime(val);
      this.dateFormatted = date.toString();
      this.syncedDate = date;
    } else {
      this.dateFormatted = "";
      this.syncedDate = new DateTime();
    }
  }

  @Watch("syncedDate")
  private syncedDateChanged(val: DateTime, oldVal: DateTime) {
    let currentDate = new DateTime(this.dateFormatted);
    if (!val.isValid()) 
      this.dateSelected = ""
    else if (!val.isSame(currentDate)) this.dateSelected = val.toUtc();
  }

  public focus() {
    this.$nextTick(() => (this.$refs.refDate as any).focus());
  }
}
</script>
