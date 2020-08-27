<template>
  <v-container fluid>
    <v-row class="ma-0 pa-0">
      <v-col class="ma-0 pa-0">
        <v-data-table
          :headers="headersApplications"
          :items="applications"
          :readonly="readonly"
          disable-pagination
          hide-default-footer
          dense
          sort-by="Nom"
          @click:row="loadPermissions"
        >
          <template v-slot:[`item.Acces`]="{ item }">
            <v-simple-checkbox :value="hasAccessApplication(item)" disabled></v-simple-checkbox>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <GridPermissionsVue ref="PermissionsVue"></GridPermissionsVue>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import { Permission } from '@/models/GestionUtilisateur/Permission';
import { Application } from '@/models/GestionUtilisateur/Application';
import { GestionUtilisateurApi } from '../../../api/GestionUtilisateurApi';
import GridPermissionsVue from './GridPermissions.vue';
import { Utilisateur } from '../../../models/Login/Utilisateur';

@Component({
  name: 'GridApplications',
  components: { GridPermissionsVue }
})
export default class extends Vue {
  @PropSync('IsReadOnly')
  public readonly!: boolean;
  @PropSync('Permissions')
  private allPermissions!: Permission[];
  @PropSync('Applications')
  private applications!: Application[];
  @PropSync('Utilisateur')
  private utilisateur!: Utilisateur;

  private selected: Application[] = [];
  private permissions: Permission[] = [];

  private headersApplications = [
    { text: 'Nom', value: 'Nom', width: 300 },
    { text: 'Accès', value: 'Acces', width: 70 }
  ];

  @Watch('selected')
  private async refreshPermissions() {
    if (this.selected) {
      const applicationSelected = this.selected[0];
      this.permissions = await GestionUtilisateurApi.getPermissionsForApplication(applicationSelected.Id);
    }
  }

  public loadPermissions(application: Application) {
    (this.$refs.PermissionsVue as GridPermissionsVue)
      .open(application, this.utilisateur, this.allPermissions, this.readonly)
      .then((resp: Permission[]) => {
        this.allPermissions = resp;
      })
      .catch();
  }

  private hasAccessApplication(application: Application) {
    return !!this.allPermissions?.find((e) => e.ApplicationId === application.Id);
  }
}
</script>

<style scopped>
#dataTable tbody tr {
  cursor: pointer;
}
</style>
