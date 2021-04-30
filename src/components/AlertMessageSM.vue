<template>
  <v-col class="shrink" cols="12 pb-0 mb-0" v-if="message">
    <v-alert class="shrink  ma-0 pa-1" :type="type" dense>
      <v-row class="shrink ma-0 pa-0">
        <v-col class="grow ma-0 pa-0">
          {{ message }}
        </v-col>
        <v-col class="shrink ma-0 pa-0">
          <v-btn x-small text v-if="messageDetails" class="mr-3 pa-0" @click="dialog = true">voir détail</v-btn>
        </v-col>
        <v-col class="shrink ma-0 pa-0">
          <v-icon class="ml-auto" @click.native.stop.prevent="message=''">mdi-close-circle</v-icon>
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
export default class AlertMessageSM extends Vue {
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
