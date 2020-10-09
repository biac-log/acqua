import { DateTime } from '@/models/DateTime';
import { Devise, DeviseDTO } from '@/models/Devise/Devise';
import { DeviseMaintenance, DeviseMaintenanceDTO } from '@/models/Devise/DeviseMaintenance';
import { PaginationResult } from '@/models/PaginationResult';
import api from './AxiosApi';

export default abstract class DeviseApi {
  static async getAllDevises(): Promise<Devise[]> {
    const response = await api.AcQuaCore.get<DeviseDTO[]>(`/Devise/GetDevises`);
    return response.data.map((dev) => new Devise(dev));
  }

  static async getAllDevisesPaged(): Promise<PaginationResult<DeviseMaintenanceDTO>> {
    const response = await api.AcQuaCore.get(`/devise`); // TODO : Add pagination

    return response.data;
  }

  static async getDeviseById(id: number): Promise<DeviseMaintenance> {
    const response = await api.AcQuaCore.get<DeviseMaintenanceDTO>(`/devise/${id}`);

    return new DeviseMaintenance(response.data);
  }

  static async getTaux(devise: number, datePiece: DateTime): Promise<number> {
    const response = await api.AcQuaCore.get<number>(`/Devise/GetTaux?devise=${devise}&datePiece=${datePiece.toUtc()}`);
    return response.data;
  }

  static async updateDevise(
    updatedDevise: DeviseMaintenanceDTO,
    oldDevise: DeviseMaintenanceDTO
  ): Promise<boolean> {    
    const data = {
      updatedDevise,
      oldDevise
    };
    await api.AcQuaCore.put<DeviseMaintenanceDTO>(`devise`, data);
    return true;
  }

  static async createDevise(newDevise: DeviseMaintenance): Promise<boolean> {
    await api.AcQuaCore.post(`/devise`, newDevise);

    return true;
  }
}
