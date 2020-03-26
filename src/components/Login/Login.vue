<template>
  <v-app id="inspire" @keypress.enter="login">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card>
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Connexion</v-toolbar-title>
              </v-toolbar>
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
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
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
