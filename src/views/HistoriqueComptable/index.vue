
<template>
  <v-container fluid>
      <v-card>
          <v-form ref="form" v-model="isSearchValid"></v-form>
      </v-card>
  </v-container>
</template>

<script lang='ts'>

export default class HistoriqueComptableIndex extends Vue{
    private isSearchValid = false;
}
</script>

<style>

</style>