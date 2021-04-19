<template>
  <v-col cols="12" v-if="message">
    <v-alert prominent :type="type" class="ma-0 pa-0 pl-5">
      <v-row align="center">
        <v-col class="grow">{{ message }}</v-col>
        <v-col class="shrink ma-0 pa-0">
          <v-btn text v-if="messageDetails" class="ma-0 pa-0" @click="dialog = true">voir détail</v-btn>
        </v-col>
        <v-col class="shrink">
          <v-btn class="ma-2" large icon @click="message = ''">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-dialog v-model="dialog" max-width="800">
        <v-card>
          <v-card-title class="headline">{{ message }}</v-card-title>
          <v-card-text>{{ messageDetails }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-alert>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class AlertMessage extends Vue {
  @Prop() readonly type!: string;
  private message = '';
  private messageDetails = '';
  private style = '';
  private dialog = false;

  public show(message: string, messageDetails = '') {
    this.message = message;
    this.messageDetails = messageDetails;
  }

  public clear() {
    this.message = '';
    this.messageDetails = '';
  }
}
</script>

<style scoped></style>
