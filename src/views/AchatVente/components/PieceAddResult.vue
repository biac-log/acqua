<template>
  <v-dialog v-model="dialog" width="unset" @keypress.enter="sendResponse()">
    <v-card class="pa-0 ma-0">
      <v-card-text class="pa-0 ma-0">
        <v-alert
          prominent
          type="success"
          class="ma-0"
        >
          <v-row align="center">
            <v-col class="grow">
              <div class="message" v-html="message"></div>
            </v-col> 
            <v-col class="shrink">
              <v-btn ref="btn" outlined @click="sendResponse()">{{ this.btnLabel }}</v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from "vue-property-decorator";

@Component({
  name: "PieceAddResult"
})
export default class extends Vue {
  private dialog: boolean = false;
  private windowTitle: string = "";
  private message: string = "";
  private color: string = "success";
  private resolve: any;
  private reject: any;
  private btnLabel: string = "Ok";

  public open(
    windowTitle: string,
    message: string,
    color?: string,
    btnLabel?: string
  ): Promise<boolean> {
    setTimeout(() => {
      (this.$refs.btn as any).$el.focus();
    });
    this.windowTitle = windowTitle;
    this.message = message;
    this.color = color ? color : "primary";
    this.btnLabel = btnLabel ? btnLabel : "Oui";
    this.dialog = true;
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private sendResponse() {
    this.dialog = false;
    this.resolve();
  }
}
</script>

<style scoped>
.message{
    font-size: 18px;
}

.message >>> b{
    font-size: 20px;
}
</style>
