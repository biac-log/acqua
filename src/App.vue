<template>
	<v-app>
		<v-app-bar app color="primary" dark>
			<v-toolbar-title class="text-uppercase" short>
				<span>AcQua</span>
				<button @click="logout">Logout</button>
			</v-toolbar-title>

			<v-spacer></v-spacer>
			{{ username }}
		</v-app-bar>

		<v-content>
			<router-view />
		</v-content>
	</v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "./store/modules/user";

@Component
export default class App extends Vue {
  get username() {
    return UserModule.username;
  }

  private logout() {
    UserModule.Logout();
  }
}
</script>
