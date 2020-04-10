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
        :label="label"
        :prepend-icon="isReadonly ? '' : 'mdi-calendar'"
        :filled="isReadonly"
        :readonly="isReadonly"
        @click:prepend="menuDate = true"
        @blur="dateSelected = parseDate(dateFormatted)"
        hide-details
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
  @PropSync("date", { type: Date })
  public syncedDate!: Date;

  private parseDate(date: string) {
    if (!date) return null;
    const [day, month, year] = date.replace(/\-/g, "/").split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  @Watch("dateSelected")
  private dateSelectedChanged(val: string, oldVal: string) {
    const [year, month, day] = val.split("-");
    this.dateFormatted = `${day}/${month}/${year}`;
    const dateToSync = val ? new Date(val) : new Date();
    if(dateToSync.getTime() != this.syncedDate.getTime())
      this.syncedDate = val ? new Date(val) : new Date();
  }

  @Watch("syncedDate")
  private syncedDateChanged(val: Date, oldVal: Date) {
    if (moment(val).format("YYYY-MM-DD") != this.dateSelected)
      this.dateSelected = moment(val).format("YYYY-MM-DD");
  }
}
</script>
