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
#nprogress .bar {
	background-color: #FFB74D !important;
}

.v-btn:not(.v-btn--text):not(.v-btn--outlined):focus:before {
    opacity: 0.30;
    border: grey;
    border-style: dotted;
    border-width: 2.5px;
}
</style>
