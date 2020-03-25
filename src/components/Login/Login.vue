<template>
	<div id="app" @keypress.enter="login">
		<v-app id="inspire">
			<v-content>
				<v-container fluid fill-height>
					<v-layout align-top justify-center>
						<v-flex xs12 sm8 md4>
							<v-card-text>
								<v-form>
									<v-text-field
										label="Utilisateur"
										name="login"
										prepend-icon="mdi-account"
										type="text"
										v-model="username"
									></v-text-field>

									<v-text-field
										id="password"
										label="Mot de passe"
										name="password"
										prepend-icon="mdi-lock"
										type="password"
										v-model="password"
									></v-text-field>
								</v-form>
							</v-card-text>

							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="primary" :loading="loading" @click="login">Se connecter</v-btn>
							</v-card-actions>

							<v-card-text v-if="errorMessage != ''">
								<v-alert type="warning">{{ errorMessage }}</v-alert>
							</v-card-text>
							<!-- </v-card> -->
						</v-flex>
					</v-layout>
				</v-container>
			</v-content>
		</v-app>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "@/store/modules/user";

@Component({})
export default class Login extends Vue {
  public username: string = "";
  public password: string = "";
  public loading: Boolean = false;
  public errorMessage: string = "";

  public login() {
    this.loading = true;
    this.errorMessage = "";

    const { username, password } = this;
    UserModule.Login({ username, password })
      .then(() => {
        this.username = "";
        this.password = "";
        this.$router.push("/");
      })
      .catch(reason => {
        this.errorMessage = reason;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>
