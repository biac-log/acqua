<template>
  <div>
    <!-- slot for parent component to activate the file changer -->
    <div @click="launchFilePicker()">
      <slot name="activator"></slot>
    </div>
    <!-- image input: style is set to hidden and assigned a ref so that it can be triggered -->
    <input
      type="file"
      ref="file"
      :name="uploadFieldName"
      @change="onFileChange($event.target.name, $event.target.files)"
      style="display:none"
    />
    <!-- error dialog displays any potential error messages -->
    <v-dialog v-model="errorDialog" max-width="300">
      <v-card>
        <v-card-text class="subheading">{{ errorText }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="errorDialog = false" flat>Compris!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

@Component({
  name: 'image-input'
})
export default class extends Vue {
  private errorDialog: boolean | null = null;
  private errorText = '';
  private uploadFieldName = 'file';
  private maxSize = 1024;

  @PropSync('IsReadOnly')
  private readonly!: boolean;

  private value!: Record<string, any>;

  private launchFilePicker() {
    (this.$refs.file as any).click();
  }

  private onFileChange(fieldName: string, file: any) {
    const { maxSize } = this;
    const imageFile = file[0];
    if (file.length > 0) {
      const size = imageFile.size / maxSize / maxSize;
      if (!imageFile.type.match('image.*')) {
        // check whether the upload is an image
        this.errorDialog = true;
        this.errorText = 'Sélectionner un fichier de type image';
      } else if (size > 1) {
        // check whether the size is greater than the size limit
        this.errorDialog = true;
        this.errorText = 'Le fichier est trop volumineux! Sélectionner une image en-dessous de 1MB';
      } else {
        // Append file into FormData and turn file into image URL
        const formData = new FormData();
        const imageURL = URL.createObjectURL(imageFile);
        formData.append(fieldName, imageFile);
        // Emit the FormData and image URL to the parent component
        this.$emit('input', { formData, imageURL });
      }
    }
  }
}
</script>
