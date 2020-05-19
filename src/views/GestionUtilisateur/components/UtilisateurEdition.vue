<template>
  <v-dialog v-model="dialog" :height="1000" :width="1000" @keydown.f2="ModifierUtilisateur">
    <v-form ref="form" v-model="isValid" lazy-validation>
      <v-card class>
        <v-toolbar color="primary" dark flat>
          <v-card-title class="d-flex justify-start">
            <div v-if="utilisateur.ID" class="font-weight-light mr-2">Code</div>
            <div v-if="utilisateur.ID" class="font-weight-medium mr-5">{{ utilisateur.ID }}</div>

            <div v-if="utilisateur.ID" class="font-weight-light mr-2">Nom</div>
            <div v-if="utilisateur.ID" class="font-weight-medium mr-5">{{ utilisateur.NomPrenom }}</div>

            <div v-if="!utilisateur.ID" class="font-weight-light mr-2">Nouveau utilisateur</div>
          </v-card-title>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-5"
            color="success"
            @click="ModifierUtilisateur"
            v-if="utilisateurReadonly"
          >
            <v-icon left>mdi-pencil</v-icon>Modifier
          </v-btn>
          <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-tabs>
            <v-tab key="tabOne">Informations générales</v-tab>
            <v-tab key="tabTwo">Permissions</v-tab>
            <v-tab-item key="tabOne">
              <v-row>
                <v-col>
                  <v-text-field
                    v-if="utilisateur.ID"
                    label="Nom prénom"
                    ref="nomPrenom"
                    v-model="nomPrenom"
                    :value="nomPrenom"
                    :filled="utilisateurReadonly"
                    :readonly="true"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    v-else
                    label="Nom prénom"
                    ref="nomPrenom"
                    v-model="nomPrenom"
                    :value="nomPrenom"
                    validate-on-blur
                    autofocus
                  ></v-text-field>
                  <v-text-field
                    v-if="utilisateur.ID"
                    label="Code"
                    ref="code"
                    v-model="code"
                    :value="code"
                    :filled="utilisateurReadonly"
                    :readonly="true"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    v-else
                    label="Code"
                    ref="code"
                    v-model="code"
                    :value="code"
                    :readonly="true"
                    tabindex="-1"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    v-if="utilisateur.ID"
                    label="Mot de passe"
                    ref="motDePasse"
                    v-model="motDePasse"
                    type="password"
                    :value="motDePasse"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    v-else
                    label="Mot de passe"
                    ref="motDePasse"
                    v-model="motDePasse"
                    type="password"
                    :value="motDePasse"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="ID active directory"
                    ref="idActiveDirectory"
                    v-model="idActiveDirectory"
                    :value="idActiveDirectory"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Fonction"
                    ref="fonction"
                    v-model="fonction"
                    :value="fonction"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-select
                    label="Département"
                    persistent-hint
                    :items="departements"
                    v-model="departement"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    :height="utilisateurReadonly ? '40' : '30'"
                  ></v-select>
                  <v-select
                    label="Langue"
                    persistent-hint
                    :items="langues"
                    v-model="langue"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    :height="utilisateurReadonly ? '40' : '30'"
                  ></v-select>
                  <v-text-field
                    label="Adresse 1"
                    ref="adresseLigne1"
                    v-model="adresseLigne1"
                    :value="adresseLigne1"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Adresse 2"
                    ref="adresseLigne2"
                    v-model="adresseLigne2"
                    :value="adresseLigne2"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Adresse 3"
                    ref="adresseLigne3"
                    v-model="adresseLigne3"
                    :value="adresseLigne3"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    label="Téléphone"
                    ref="telephone"
                    v-model="telephone"
                    :value="telephone"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Numéro interne"
                    ref="numeroInterne"
                    v-model="numeroInterne"
                    :value="numeroInterne"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Fax"
                    ref="fax"
                    v-model="fax"
                    :value="fax"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                  <v-text-field
                    label="Email"
                    ref="email"
                    v-model="email"
                    :value="email"
                    :filled="utilisateurReadonly"
                    :readonly="utilisateurReadonly"
                    :hide-details="utilisateurReadonly"
                    validate-on-blur
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item key="tabTwo">
              <v-row fill-height>
                <GridApplications
                  ref="gridApplications"
                  :Applications.sync="applications"
                  :Permissions.sync="permissions"
                  :IsReadOnly.sync="utilisateurReadonly"
                  :Utilisateur.sync="utilisateur"
                ></GridApplications>
              </v-row>
            </v-tab-item>
          </v-tabs>
        </v-card-text>
        <v-divider v-if="!utilisateurReadonly"></v-divider>
        <v-card-actions v-if="!utilisateurReadonly" class="d-flex">         
            <v-btn
              color="blue darken-1"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              outlined
              @click="cancelEdit()"
              tabindex="-1"
            >
              <v-icon left>mdi-close</v-icon>Annuler
            </v-btn>
            <v-btn
              ref="btnValidate"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              color="success"
              :loading="saveLoading"
              :disabled="!isValid"
              @click="save()"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>  
        </v-card-actions>
        <v-alert
              type="error"
              border="left"
              v-if="errorMessage"
              class="ml-4 mr-4"
            >{{errorMessage}}</v-alert>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import moment from "moment";
import { Component, Vue, PropSync, Emit, Watch } from "vue-property-decorator";
import { Utilisateur } from "@/models/GestionUtilisateur/Utilisateur";
import { Permission } from "@/models/GestionUtilisateur/Permission";
import ImageUploader from "@/components/imageUploader/imageUploader.vue";
import { GestionUtilisateurApi } from "@/api/GestionUtilisateurApi";
import { DepartementApi } from "@/api/DepartementApi";
import GridApplications from "./GridApplications.vue";
import { displayAxiosError } from "@/utils/ErrorMethods";
import { Application } from "../../../models/GestionUtilisateur/Application";

@Component({
  name: "UtilisateurEdition",
  components: { GridApplications, ImageUploader }
})
export default class extends Vue {
  public utilisateurReadonly: boolean = true;
  private errorMessage: string = "";
  private isValid: boolean = true;

  private Avatar: any = null;

  //Statiques
  private departements: string[] = [];
  private langues: string[] = ["Français", "Deutsch", "English"];

  //Titre
  private utilisateur: Utilisateur = new Utilisateur();
  private numeroUtilisateur = "";

  //Edition Pemissions
  private permissions: Permission[] = [];
  private applications: Application[] = [];

  //Encodage
  private nomPrenom = "";
  private code = "";
  private motDePasse = "";
  private idActiveDirectory = "";
  private fonction = "";
  private departement = "";
  private langue = "";
  private adresseLigne1 = "";
  private adresseLigne2 = "";
  private adresseLigne3 = "";
  private telephone = "";
  private numeroInterne = "";
  private fax = "";
  private email = "";

  private isEdit = false;
  public dialog = false;
  private resolve!: any;
  private reject!: any;

  private isErrorLoading = false;
  mounted() {
    this.LoadDepartements();
  }

  private async LoadDepartements() {
    try {
      const departements = await DepartementApi.getDepartements();
      this.departements = departements.map(e => e.Nom);
    } catch (err) {
      this.isErrorLoading = true;
    }
  }

  public open(
    utilisateur: Utilisateur,
    apps: Application[]
  ): Promise<Utilisateur> {
    this.dialog = true;
    this.utilisateurReadonly = !!utilisateur;
    this.applications = apps;
    this.SetUtilisateur(utilisateur);
    // this.$nextTick(() => (this.$refs.numeroCompteTier as any)?.focus());
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private SetUtilisateur(utilisateur: Utilisateur) {
    this.permissions = utilisateur?.Permissions;

    this.utilisateur = !!utilisateur ? utilisateur : new Utilisateur();
    this.numeroUtilisateur = utilisateur?.ID;

    this.nomPrenom = utilisateur?.NomPrenom;
    this.code = utilisateur?.ID;
    this.motDePasse = !!utilisateur ? 'xxxxxxx' : '';
    this.idActiveDirectory = utilisateur?.IdActiveDirectory;
    this.fonction = utilisateur?.Fonction;
    this.departement = utilisateur?.Departement;
    this.langue = utilisateur?.Langue;
    this.adresseLigne1 = utilisateur?.AdresseLigne1;
    this.adresseLigne2 = utilisateur?.AdresseLigne2;
    this.adresseLigne3 = utilisateur?.AdresseLigne3;
    this.telephone = utilisateur?.Telephone;
    this.numeroInterne = utilisateur?.TelephoneInterne;
    this.fax = utilisateur?.Fax;
    this.email = utilisateur?.Email;
  }

  private async ModifierUtilisateur() {
    this.utilisateurReadonly = false;
    this.$nextTick(() => (this.$refs.nomPrenom as any)?.focus());
  }

  private saveLoading: boolean = false;
  private saveUtilisateur() {
    (this.$refs.form as any).validate();
    this.$nextTick(() => {
      if (this.isValid) {
        this.save();
      }
    });
  }

  private save() {
    this.saveLoading = true;
    this.errorMessage = "";
    let model = this.GetModelToSave();
    this.utilisateurReadonly = true;
    GestionUtilisateurApi.save(model)
      .then(resp => {
        this.resolve(resp);
        this.dialog = false;
      })
      .catch(err => {
        this.errorMessage = displayAxiosError(err);
        this.utilisateurReadonly = false;
      })
      .finally(() => {
        this.saveLoading = false;
      });
  }

  private GetModelToSave(): Utilisateur {
    this.utilisateur.NomPrenom = this.nomPrenom;
    this.utilisateur.MotDePasseApollo = this.motDePasse !== 'xxxxxxx' ? this.motDePasse : '';
    this.utilisateur.IdActiveDirectory = this.idActiveDirectory;
    this.utilisateur.Fonction = this.fonction;
    this.utilisateur.Departement = this.departement;
    this.utilisateur.Langue = this.langue;
    this.utilisateur.AdresseLigne1 = this.adresseLigne1;
    this.utilisateur.AdresseLigne2 = this.adresseLigne2;
    this.utilisateur.AdresseLigne3 = this.adresseLigne3;
    this.utilisateur.Telephone = this.telephone;
    this.utilisateur.TelephoneInterne = this.numeroInterne;
    this.utilisateur.Fax = this.fax;
    this.utilisateur.Email = this.email;
    this.utilisateur.Permissions = this.permissions;
    return this.utilisateur;
  }

  private cancelEdit() {
    if (!!this.utilisateur.ID) {
      this.utilisateurReadonly = true;
      this.SetUtilisateur(this.utilisateur);
    } else this.closeDialog();
  }

  private closeDialog() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style>
.textMini {
  font-size: 12px;
}

.warningMessage {
  color: #fb8c00;
  font-weight: 500;
}
</style>
