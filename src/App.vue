<template>
    <v-app>
        <router-view />
        <service-worker-update-popup />
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ServiceWorkerUpdatePopup from '@/components/ServiceWorkerUpdatePopup.vue'


@Component({
	name: "App",
	components: { ServiceWorkerUpdatePopup }
})
export default class App extends Vue {

}
</script>

<style lang="scss">
@import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";

#nprogress .bar {
    background-color: #FFB74D !important;
}

.v-btn:not(.v-btn--text):not(.v-btn--outlined):focus:before {
    opacity: 0.30;
    border: grey;
    border-style: dotted;
    border-width: 2.5px;
}

.theme--light.v-select .v-select__selection--disabled {
    color: rgba(0, 0, 0, 0.87) !important;
}

.shortcutTooltip{
  background: darkslategray;
  border: 1px solid white;
  padding: 2px 5px 2px 5px;
  margin-left: 3px;
  font-size: 12px;
}
</style>
