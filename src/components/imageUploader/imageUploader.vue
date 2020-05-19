<template>
  <v-container grid-list-xl>
    <image-input v-model="avatar">
      <div slot="activator">
        <v-avatar :IsReadOnly.sync='readonly' size="150px" v-ripple v-if="!avatar" class="grey lighten-3 mb-3">
          <span>Cliquez pour ajouter une photo</span>
        </v-avatar>
        <v-avatar :IsReadOnly.sync='readonly' size="150px" v-ripple v-else class="mb-3">
          <img :src="avatar.imageURL" alt="avatar" />
        </v-avatar>
      </div>
    </image-input>
    <v-slide-x-transition>
      <div v-if="avatar">
        <v-btn class="primary" @click="removeImage">Supprimer</v-btn>
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script lang="ts">
import ImageInput from "./imageInput.vue";
import { Component, Vue, Watch, PropSync } from "vue-property-decorator";

@Component({
  name: "image-uploader",
  components: { ImageInput }
})
export default class extends Vue {
  @PropSync('IsReadOnly')
  private readonly!: boolean
  @PropSync('Avatar')
  private avatar!: any;
  private ImageInput: ImageInput | null = null;

  private removeImage() {
    console.log(this.avatar)
    this.avatar = null
  }
}
</script>

<style>
</style>