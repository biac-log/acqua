<template>
	<v-app id="inspire">
		<v-navigation-drawer v-model="drawer" app>
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
			<v-app-bar-nav-icon @click.stop="drawer = !drawer" />
			<v-toolbar-title>Application</v-toolbar-title>
			<v-spacer></v-spacer>
			{{ username }}
			<v-btn icon class="ml-5" @click="logout">
				<v-icon>mdi-logout</v-icon>
			</v-btn>
		</v-app-bar>

		<v-content>
			<v-container class="fill-height" fluid>
				<app-main />
			</v-container>
		</v-content>
	</v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { AppMain } from "./components";
import { UserModule } from "@/store/modules/user";

@Component({
  name: "Layout",
  components: {
    AppMain
  }
})
export default class extends Vue {
  private drawer: Boolean = true;
  private source: String = "";

  get username() {
    return UserModule.username;
  }

  private logout() {
    UserModule.Logout();
    this.$router.push("/login");
  }
}
</script>