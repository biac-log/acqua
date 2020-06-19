import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { UserModule } from "@/store/modules/user";
import { DateTime } from '@/models/DateTime';
import { Devise, DeviseDTO } from "@/models/Devise/Devise";

export abstract class DeviseApi {
  private static achatVenteAxios = Axios.create({headers: { Authorization: `Bearer ${UserModule.token}` }});

  static async getAllDevises(): Promise<Devise[]> {
    let response = await this.achatVenteAxios.get<DeviseDTO[]>(`${process.env.VUE_APP_ApiAcQuaCore}/Devise/GetDevises`);
    return response.data.map(dev => new Devise(dev));
  }

  static async getTaux(devise: number, datePiece: DateTime): Promise<number> {
    let response = await this.achatVenteAxios.get<number>(`${process.env.VUE_APP_ApiAcQuaCore}/Devise/GetTaux?devise=${devise}&datePiece=${datePiece.toUtc()}`);
    return response.data;
  }
}