import { Permission, PermissionDTO } from '@/models/GestionUtilisateur/Permission';
import { Utilisateur, UtilisateurDTO } from '@/models/GestionUtilisateur/Utilisateur';
import { Application, ApplicationDTO } from '@/models/GestionUtilisateur/Application';
import api from './AxiosApi';

export abstract class GestionUtilisateurApi {
  static async getUtilisateurs(onlyActif: boolean): Promise<Utilisateur[]> {
    const response = await api.GestionUser.get<UtilisateurDTO[]>(`/User/GetAllUsers/${onlyActif}`);
    return response.data.map((user) => new Utilisateur(user));
  }

  static async getPermissionsForUser(user: string): Promise<Permission[]> {
    const response = await api.GestionUser.get<PermissionDTO[]>(`/Permission/GetForUser?user=${user}`);
    return response.data.map((perm) => new Permission(perm));
  }

  static async getPermissionsForApplication(app: string): Promise<Permission[]> {
    const response = await api.GestionUser.get<PermissionDTO[]>(`/Permission/GetForApplication/${app}`);
    return response.data.map((perm) => new Permission(perm));
  }

  static async getApplications(): Promise<Application[]> {
    const response = await api.GestionUser.get<ApplicationDTO[]>(`/Application/GetAll`);
    return response.data.map((app) => new Application(app));
  }

  static async save(user: Utilisateur): Promise<Utilisateur> {
    const response = await api.GestionUser.post<UtilisateurDTO>(`/User/Save`, user);
    return new Utilisateur(response.data);
  }

  static async idExist(id: string): Promise<boolean> {
    const response = await api.GestionUser.get<boolean>(`/User/IdExist/${id}`);
    return response.data;
  }
}
