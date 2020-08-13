import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { UserModule } from "@/store/modules/user";
import { DateTime } from '@/models/DateTime';
import { Devise, DeviseDTO } from "@/models/Devise/Devise";
import api from "./AxiosApi"

export abstract class DeviseApi {
  static async getAllDevises(): Promise<Devise[]> {
    let response = await api.AcQuaCore.get<DeviseDTO[]>(`/Devise/GetDevises`);
    return response.data.map(dev => new Devise(dev));
  }

  static async getTaux(devise: number, datePiece: DateTime): Promise<number> {
    let response = await api.AcQuaCore.get<number>(`/Devise/GetTaux?devise=${devise}&datePiece=${datePiece.toUtc()}`);
    return response.data;
  }
}