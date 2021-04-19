<template>
  <v-app id="inspire">
    <!-- Click display only child -->
    <v-navigation-drawer v-model="drawer" disable-resize-watcher permanent app width="86">
      <v-list dense>
        <v-list-item v-if="parentRoute" :key="previousName" @click="previous()">
          <v-list-item-content>
            <v-icon>mdi-keyboard-backspace</v-icon>
            <v-list-item-title>{{ previousName }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <template v-for="route in routesDisplay">
          <v-list-item
            link
            v-if="!route.children || route.children.length == 1"
            :key="route.title"
            :to="route"
            class="pr-1 pl-1"
          >
            <v-list-item-content class="text-center">
              <v-icon class="align-self-center">{{ route.meta.icon }}</v-icon>
              <v-list-item-title class="align-self-center text-wrap">{{ route.meta.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-else :key="route.meta.title" @click="displayChildRoute(route)" class="pr-1 pl-1">
            <v-list-item-content class="text-center">
              <v-icon class="align-self-center">{{ route.meta.icon }}</v-icon>
              <v-list-item-title class="align-self-center text-wrap">{{ route.meta.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="blue" dark>
      <!-- <v-app-bar-nav-icon @click.stop="mini = !mini">
        <v-icon v-if="mini">mdi-forwardburger</v-icon>
        <v-icon v-if="!mini">mdi-backburger</v-icon>
      </v-app-bar-nav-icon> -->
      <v-toolbar-title class="d-flex justify-start">AcQua / {{ currentRoute }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <span style="width: 400px">
        <v-autocomplete
          v-model="routeSearch"
          :items="searchItems"
          :search-input.sync="search"
          item-text="name"
          item-value="name"
          label="Naviguer vers"
          @change="setRoute"
          append-icon=""
          return-object
          filled
          rounded
          dense
          hide-details
          class="mr-10"
          full-width
          prepend-inner-icon="mdi-magnify"
        >
          <template v-slot:item="{ item }">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </span>
      <span style="width: 300px; padding-top: 25px">
        <v-select
          class="mr-10"
          outlined
          dense
          :v-if="societes.length > 1"
          label="Société"
          :items="societes"
          item-text="name"
          v-model="societeSelected"
          return-object
        ></v-select>
      </span>
      {{ username }}
      <v-btn v-if="!singleUserMode" icon class="ml-5" @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <app-main />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { AppMain } from './components';
import { UserModule } from '@/store/modules/user';
import { SocieteModule } from '@/store/modules/companies';
import { RouteConfig } from 'vue-router';
import { PermissionModule } from '@/store/modules/permissions';
import { Societe } from '@/models/Societe/societe';
import { ApplicationModule } from '@/store/modules/application';

@Component({
  name: 'Layout',
  components: {
    AppMain,
  },
})
export default class extends Vue {
  private drawer = true;
  private mini = true;
  private source = '';
  private currentRoute: any = '';
  private previousName = 'Accueil';

  private get singleUserMode() {
    return ApplicationModule.singleUserMode;
  }

  mounted() {
    this.currentRoute = this.$route.name;
    this.routesDisplay = PermissionModule.routes.filter((r) => !r.meta || !r.meta.hidden);
    PermissionModule.routes
      .filter((r) => !r.meta || !r.meta.hidden)
      .forEach((r) => {
        if (!r.children || r.children.length == 1) {
          const firstChild = this.getOnlyChildren(r);
          this.searchItems.push({ name: firstChild.meta.title, icon: firstChild.meta.icon, route: r });
        } else {
          r.children.forEach((c) => {
            this.searchItems.push({ name: `${r.meta.title} > ${c.meta.title}`, icon: c.meta.icon, route: c });
          });
        }
      });
  }

  get routes() {
    return PermissionModule.routes.filter((r) => !r.meta || !r.meta.hidden);
  }

  private previousRoute: RouteConfig[] = [];
  private routesDisplay: RouteConfig[] = [];
  private parentRoute: RouteConfig | null = null;
  private displayChildRoute(route: RouteConfig) {
    this.parentRoute = route;
    if (route.children) {
      this.routesDisplay = route.children;
    }
  }

  private previous() {
    this.parentRoute = null;
    this.routesDisplay = PermissionModule.routes.filter((r) => !r.meta || !r.meta.hidden);
  }

  private getOnlyChildren(route: RouteConfig) {
    if (route.children) {
      for (const child of route.children) {
        if (!child.meta || !child.meta.hidden) {
          return child;
        }
      }
    }
    // If there is no children, return itself with path removed,
    // because this.basePath already conatins item's path information
    return { ...route, path: '' };
  }

  private search = '';
  private searchItems: { name: string; icon: string; route: RouteConfig }[] = [];
  private routeSearch: { name: string; icon: string; route: RouteConfig } | null = null;
  private setRoute(item: { name: string; icon: string; route: RouteConfig }) {
    this.$router.push(item.route);
    this.$nextTick(() => {
      this.search = '';
      this.routeSearch = null;
    });
  }

  @Watch('$route')
  private onRouteChange() {
    this.currentRoute = this.$route.name;
  }

  get username() {
    return UserModule.username;
  }

  get societes() {
    return SocieteModule.societes;
  }

  get societeSelected() {
    return SocieteModule.societeSelected;
  }

  set societeSelected(societe: Societe) {
    SocieteModule.selectSociete(societe);
  }

  private logout() {
    UserModule.logout();
    this.$router.push('/login');
  }
}
</script>
