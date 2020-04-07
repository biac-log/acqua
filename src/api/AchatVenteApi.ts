import Axios from "axios";

import PieceComptable, { PieceComptableDTO } from '@/models/AchatVente/PieceComptable';

export abstract class AchatVenteApi {
  private static achatVenteAxios = Axios.create();

  static async getDateEcheance(typeCompte:string, numeroCompte: number, date: Date): Promise<Date>{
    let response = await this.achatVenteAxios.get<Date>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetDateEcheance?typeCompte=${typeCompte}F&numeroCompte=${numeroCompte}&datePiece=${date}`);
    return response.data;
  }

  static async getPieceComptable(numeroJournal: string | number, numeroPiece : string | number): Promise<PieceComptable>{
    let response = await this.achatVenteAxios.get<PieceComptableDTO>(`${process.env.VUE_APP_ApiAcQuaCore}/AchatVente/GetPieceComptable?journal=${numeroJournal}&piece=${numeroPiece}`);
    return new PieceComptable(response.data);
  }
}