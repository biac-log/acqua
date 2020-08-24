import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import fr from 'vuetify/src/locale/fr';

Vue.use(Vuetify);

Vue.component('my-component', {
  methods: {
    changeLocale() {
      this.$vuetify.lang.current = 'fr';
    }
  }
});

export default new Vuetify({
  lang: {
    locales: { fr },
    current: 'fr'
  }
});
