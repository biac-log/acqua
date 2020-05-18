  <template>
  <v-dialog
    v-model="dialog"
    width="1500"
    scrollable
    @click:outside="closeDialog"
    @keydown.esc="closeDialog()"
  >
    <v-form ref="form" v-model="isValid">
      <v-card>
        <v-card-title class="d-flex justify-start">
          <div class="font-weight-light mr-2">Permissions de</div>
          <div class="font-weight-medium mr-2">{{ applicationNom }}</div>
          <div class="font-weight-light mr-2">pour</div>
          <div class="font-weight-medium mr-5">{{ utilisateur.NomPrenom }}</div>
          <v-spacer></v-spacer>
          <v-btn ref="buttonClose" class="ml-10" icon @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headersPermissions"
            :items="permissions"
            disable-pagination
            hide-default-footer
            dense
            sort-by="Nom"
            :loading="loading"
          >
            <template v-slot:item.Acces="{ item }">
              <v-checkbox
                class="ma-0 pa-0"
                :value="HasAccessPermission(item)"
                @change="changePermission(item, HasAccessPermission(item))"
                hide-details
              ></v-checkbox>
            </template>
          </v-data-table>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex">
          <v-btn
            color="blue darken-1"
            class="ma-2 mt-0 pr-4 align-self-start"
            tile
            outlined
            @click="closeDialog()"
            tabindex="-1"
          >
            <v-icon left>mdi-close</v-icon>Fermer
          </v-btn>
          <v-btn
            ref="btnValidate"
            class="ma-2 mt-0 pr-4 align-self-start"
            tile
            color="success"
            :disabled="!isValid"
            @click="save()"
          >
            <v-icon left>mdi-checkbox-marked-circle</v-icon>Valider
          </v-btn>
        </v-card-actions>
        <v-alert type="error" border="left" v-if="errorMessage" class="ml-4 mr-4">{{errorMessage}}</v-alert>
      </v-card>
    </v-form>
  </v-dialog>
</template>
  
<script lang="ts">
import { Component, Vue, PropSync, Watch } from "vue-property-decorator";
import {
  Permission,
  PermissionDTO
} from "@/models/GestionUtilisateur/Permission";
import { Application } from "@/models/GestionUtilisateur/Application";
import { GestionUtilisateurApi } from "../../../api/GestionUtilisateurApi";
import { Utilisateur } from "../../../models/Login/Utilisateur";

@Component({
  name: "GridPermissions"
})
export default class extends Vue {
  private applicationId = "";
  private applicationNom = "";
  private permissions: Permission[] = [];
  private permissionsUtilisateur: Permission[] = [];
  private utilisateur: Utilisateur = new Utilisateur();
  private loading = false;
  private errorMessage = "";

  public isValid = false;
  public dialog = false;
  private resolve!: any;
  private reject!: any;

  private headersPermissions = [
    { text: "Nom", value: "Nom" },
    { text: "Description", value: "Description" },
    { text: "Accès", value: "Acces" }
  ];

  public open(
    application: Application,
    utilisateur: Utilisateur,
    permissions: Permission[]
  ): Promise<Permission[]> {
    this.dialog = true;
    this.applicationId = application.Id;
    this.applicationNom = application.Nom;
    this.utilisateur = utilisateur;
    this.permissionsUtilisateur = Array.from(permissions);
    this.LoadPermissions();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private changePermission(permission: Permission, value: boolean) {
    if (!value) {
      this.permissionsUtilisateur.push(permission)
    } else {
      const index = this.permissionsUtilisateur.indexOf(permission);
      if (index > -1) {
        this.permissionsUtilisateur.splice(index, 1);
      }
    }
  }

  private async LoadPermissions() {
    try {
      this.loading = true;
      this.permissions = await GestionUtilisateurApi.getPermissionsForApplication(
        this.applicationId
      );
    } catch (err) {
      this.errorMessage = err;
    } finally {
      this.loading = false;
    }
  }

  private closeDialog() {
    this.dialog = false;
    this.reject();
  }

  private save() {
    (this.$refs.form as any).validate();
    if (this.isValid) {
      this.dialog = false;
      this.resolve(this.permissionsUtilisateur);
    }
  }

  private HasAccessPermission(permission: Permission) {
    return !!this.permissionsUtilisateur.find(e => e.Id === permission.Id);
  }
}
</script>

<style scopped>
.v-data-table {
  word-break: initial;
  white-space: nowrap;
}

#dataTable tbody tr {
  cursor: pointer;
}

tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, .05);
}
</style>
