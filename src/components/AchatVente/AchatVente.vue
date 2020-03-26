<template>
	<v-container>{{ title }}</v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: "AchatVente"
})
export default class extends Vue {
  public title: string = "Achat Vente";
}
</script>
