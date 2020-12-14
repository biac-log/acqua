<template>
  <v-app>
    <router-view />
    <service-worker-update-popup />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ServiceWorkerUpdatePopup from '@/components/ServiceWorkerUpdatePopup.vue';

@Component({
  name: 'App',
  components: { ServiceWorkerUpdatePopup }
})
export default class App extends Vue {
  mounted() {
    // Prevent focus loss on alt press. Prevents for Chrome, on Firefox you can regain focus when re-pressing alt key.
    document.addEventListener('keydown', (e) => {
      if (18 == e.keyCode && ['INPUT', 'BUTTON'].includes((e.target as Element).nodeName)) {
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      }

      // Prevent F5 default behavior
      // In Apollo, F5 was meant to open search so it was confusing for the user
      if ((e.which || e.keyCode) == 116 && !e.ctrlKey) {
        // Prevent page refresh
        e.preventDefault();
        if ((e.target as Element).nodeName == 'INPUT') {
          // If hitting F5 when in an input
          e.target?.dispatchEvent(new KeyboardEvent('keydown', { code: '70', ctrlKey: true })); // Simulate ctrl-f keypress to open search (if defined)
        }
      }
    });

    // Handle global blur/focus
    // When clicking somewhere, check
    // - if the document.activeElement is an input or a button => normal behavior, the element takes the focus
    // - if clicking nothing "specific" (should return body) => element to enable shortcuts
    // Also need to handle coming back to app via alt-tab i.e. => focus last focused element || element to enable shortcuts
    window.onclick = () => {
      if (document.activeElement?.nodeName == 'BODY') {
        document.getElementById('indexSearch')?.focus();
      }
    };

    window.onblur = () => {
      this.lastFocusId = document.activeElement?.id;
    };
    window.onfocus = () => {
      if (this.lastFocusId != null) {
        document.getElementById(this.lastFocusId)?.focus();
      } else {
        document.getElementById('indexSearch')?.focus();
      }
    };
  }
  public lastFocusId: string | undefined = '';
}
</script>

<style lang="scss">
@import '../node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css';

#nprogress .bar {
  background-color: #ffb74d !important;
}

.v-btn:not(.v-btn--text):not(.v-btn--outlined):focus:before {
  opacity: 0.3;
  border: grey;
  border-style: dotted;
  border-width: 2.5px;
}

.theme--light.v-select .v-select__selection--disabled {
  color: rgba(0, 0, 0, 0.87) !important;
}

.shortcutTooltip {
  background: darkslategray;
  border: 1px solid white;
  padding: 2px 5px 2px 5px;
  margin-left: 3px;
  font-size: 12px;
}

.v-text-field__suffix {
  color: black !important;
}

div.v-input--is-readonly.v-text-field--outlined > .v-input__control > div.v-input__slot {
  background: rgba(0, 0, 0, 0.06) !important;
}
</style>
