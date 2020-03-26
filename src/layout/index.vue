<template>
	<v-app id="inspire">
		<v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" app>
			<v-list dense>
				<v-list-item link :to="{path: '/home'}">
					<v-list-item-action>
						<v-icon>mdi-home</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Home</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				<v-list-item link :to="{path: '/achatvente'}">
					<v-list-item-action>
						<v-icon>mdi-currency-eur</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Achat Vente</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar app color="blue" dark>
			<v-app-bar-nav-icon @click.stop="mini = !mini">
				<v-icon v-if="mini">mdi-forwardburger</v-icon>
				<v-icon v-if="!mini">mdi-backburger</v-icon>
			</v-app-bar-nav-icon>
			<v-toolbar-title class="d-flex justify-start">AcQua / {{ currentRoute }}</v-toolbar-title>
			<v-spacer></v-spacer>
			{{ username }}
			<v-btn icon class="ml-5" @click="logout">
				<v-icon>mdi-logout</v-icon>
			</v-btn>
		</v-app-bar>

		<v-content>
			<v-container fluid>
				<app-main />
			</v-container>
		</v-content>
	</v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { AppMain } from "./components";
import { UserModule } from "@/store/modules/user";
import { Route } from "vue-router";

@Component({
  name: "Layout",
  components: {
    AppMain
  }
})
export default class extends Vue {
  private drawer: Boolean = true;
  private mini: Boolean = false;
  private source: String = "";
  private currentRoute: any = "";

  mounted() {
    this.currentRoute = this.$route.name;
  }

  @Watch("$route")
  private onRouteChange(route: Route) {
    this.currentRoute = this.$route.name;
  }

  get username() {
    return UserModule.username;
  }

  private logout() {
    UserModule.Logout();
    this.$router.push("/login");
  }
}
</script>