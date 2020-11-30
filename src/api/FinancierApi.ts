import {
  JournalDTO,
  Journal,
  PeriodeComptable,
  PeriodeComptableDTO,
  EntetePieceComptableDTO,
  Piece,
  PieceDTO,
  TypeCompte,
  TypeCompteDTO,
  PieceAchatVente
} from '@/models/Financier';
import { Pagination } from '@/models/Pagination';
import { PaginationResult } from '@/models/PaginationResult';
import { Reglement, ReglementDTO } from '@/models/Financier/Get/Reglement';
import { PieceSaveDTO } from '@/models/Financier/Save/PieceSave';
import api from './AxiosApi';

export abstract class FinancierApi {
  static async getPeriodes(): Promise<PeriodeComptable[]> {
    const responseCourante = await api.AcQuaCore.get<PeriodeComptableDTO>(`Financier/GetPeriodeCourante`);
    const responsePrecedente = await api.AcQuaCore.get<PeriodeComptableDTO>(`Financier/GetPeriodePrecedente`);
    const periodes: PeriodeComptable[] = [];
    periodes.push(new PeriodeComptable(responseCourante.data));
    periodes.push(new PeriodeComptable(responsePrecedente.data));
    return periodes;
  }

  static async getJournaux(): Promise<Journal[]> {
    const response = await api.AcQuaCore.get<JournalDTO[]>(`/Financier/GetJournaux`);
    return response.data.map((journal) => new Journal(journal));
  }

  static async getEntetePiecesComptables(
    numeroJournal: number,
    periode: string,
    pagination: Pagination
  ): Promise<PaginationResult<EntetePieceComptableDTO>> {
    const response = await api.AcQuaCore.get<PaginationResult<EntetePieceComptableDTO>>(
      `/Financier/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&NumeroJournal=${numeroJournal}&Periode=${periode}`
    );
    return response.data;
  }

  static async getPieceComptable(numeroJournal: string | number, numeroPiece: string | number): Promise<Piece> {
    const response = await api.AcQuaCore.get<PieceDTO>(
      `/Financier/GetPieceComptable?journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return new Piece(response.data);
  }

  static async getReglements(): Promise<Reglement[]> {
    const response = await api.AcQuaCore.get<ReglementDTO[]>(`/Financier/GetAllReglements`);
    return response.data.map((reglement) => new Reglement(reglement));
  }

  static async getTypesComptes(): Promise<TypeCompte[]> {
    const response = await api.AcQuaCore.get<TypeCompteDTO[]>(`/Financier/GetTypesCompteVentilation`);
    return response.data.map((TypeCompteDTO) => new TypeCompte(TypeCompteDTO));
  }

  static async getSoldeCompte(numeroCompte: number): Promise<number> {
    const response = await api.AcQuaCore.get<number>(`/Financier/GetSolde?numeroCompte=${numeroCompte}`);
    return response.data;
  }

  static async getPieceAchatVente(numeroJournal: number, numeroPiece: number): Promise<PieceAchatVente> {
    const response = await api.AcQuaCore.get<PieceAchatVente>(
      `/Financier/GetPieceComptableAchatVente?journal=${numeroJournal}&numeroPiece=${numeroPiece}`
    );
    return response.data;
  }

  static async deletePieceComptable(periode: string, numeroJournal: number, numeroPiece: number): Promise<boolean> {
    await api.AcQuaCore.delete<any>(
      `Financier/DeletePieceComptable?periode=${periode}&journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return true;
  }

  static async addPieceComptable(piece: PieceSaveDTO): Promise<{numeroPiece: number; hash: string;}> {
    const response = await api.AcQuaCore.post<{numeroPiece: number; hash: string;}>(`/Financier/AddPieceComptable`, piece);
    return response.data;
  }

  static async updatePieceComptable(piece: PieceSaveDTO): Promise<string> {
    const response = await api.AcQuaCore.put<string>(`/Financier/UpdatePieceComptable`, piece);
    return response.data;
  }

  static async changeNumero(periode: string, journal: number, oldNumero: number, newNumero: number): Promise<boolean> {
    await api.AcQuaCore.put(
      `/Financier/ChangementNumero?periode=${periode}&numeroJournal=${journal}&ancienNumeroPiece=${oldNumero}&nouveauNumeroPiece=${newNumero}`
    );
    return true;
  }
}
