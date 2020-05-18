import Axios from "axios";
import { Permission, PermissionDTO } from "@/models/GestionUtilisateur/Permission";
import { Utilisateur, UtilisateurDTO } from "@/models/GestionUtilisateur/Utilisateur";
import { Application, ApplicationDTO } from "@/models/GestionUtilisateur/Application";
import { UserModule } from "@/store/modules/user";

export abstract class GestionUtilisateurApi {
  private static GestionUtilisateurAxios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getUtilisateurs(onlyActif: boolean): Promise<Utilisateur[]> {
    let response = await this.GestionUtilisateurAxios.get<UtilisateurDTO[]>(`${process.env.VUE_APP_ApiGestionUser}/User/GetAllUsers/${onlyActif}`);
    return response.data.map(user => new Utilisateur(user));
  }  

  static async getPermissionsForUser(user: string): Promise<Permission[]> {
    let response = await this.GestionUtilisateurAxios.get<PermissionDTO[]>(`${process.env.VUE_APP_ApiGestionUser}/Permission/GetForUser?user=${user}`);
    return response.data.map(perm => new Permission(perm));
  }  

  static async getPermissionsForApplication(app: string): Promise<Permission[]> {
    let response = await this.GestionUtilisateurAxios.get<PermissionDTO[]>(`${process.env.VUE_APP_ApiGestionUser}/Permission/GetForApplication/${app}`);
    return response.data.map(perm => new Permission(perm));
  }  

  static async getApplications(): Promise<Application[]> {
    let response = await this.GestionUtilisateurAxios.get<ApplicationDTO[]>(`${process.env.VUE_APP_ApiGestionUser}/Application/GetAll`);
    return response.data.map(app => new Application(app));
  }  

  static async save(user: Utilisateur): Promise<any> {
    let response = await this.GestionUtilisateurAxios.post(`${process.env.VUE_APP_ApiGestionUser}/User/Save`);
    return response.data;
  }  
}
