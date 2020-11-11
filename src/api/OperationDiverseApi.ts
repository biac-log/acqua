import api from '@/api/AxiosApi';
import { TypeCompte } from '@/models/Compte/TypeCompte';
import { TypeCompteDTO } from '@/models/Financier/Get/TypeCompte';
import { EntetePieceComptable, Journal, JournalDTO, OperationDiverseToSave } from '@/models/OperationDiverse';
import { PeriodeComptable, PeriodeComptableDTO } from '@/models/OperationDiverse/PeriodeComptable';
import { PieceComptable, PieceComptableDTO } from '@/models/OperationDiverse/PieceComptable';
import { Pagination } from '@/models/Pagination';
import { PaginationResult } from '@/models/PaginationResult';

export default class OperationDiverseApi {
  static async getPeriodes(): Promise<PeriodeComptable[]> {
    const reponse = await api.AcQuaCore.get<PeriodeComptableDTO[]>(`/OperationDiverse/GetPeriodes`);
    return reponse.data.map((r) => new PeriodeComptable(r));
  }

  static async getJournaux(): Promise<Journal[]> {
    const response = await api.AcQuaCore.get<JournalDTO[]>(`/OperationDiverse/GetJournaux`);
    return response.data.map((journal) => new Journal(journal));
  }

  static async getEntetePiecesComptables(
    numeroJournal: number,
    periode: string,
    pagination: Pagination
  ): Promise<PaginationResult<EntetePieceComptable>> {
    const response = await api.AcQuaCore.get<PaginationResult<EntetePieceComptable>>(
      `/OperationDiverse/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&SortByAsc=${pagination.sortDesc}&NumeroJournal=${numeroJournal}&Periode=${periode}`
    );
    return response.data;
  }

  static async getPieceComptable(
    periode: string,
    numeroJournal: string | number,
    numeroPiece: string | number
  ): Promise<PieceComptable> {
    const response = await api.AcQuaCore.get<PieceComptableDTO>(
      `/OperationDiverse/GetPieceComptable?periode=${periode}&journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return new PieceComptable(response.data);
  }

  static async getTypesComptesOD(): Promise<TypeCompte[]> {
    const response = await api.AcQuaCore.get<TypeCompteDTO[]>(`/OperationDiverse/GetTypesCompteOD`);
    return response.data.map((TypeCompteDTO) => new TypeCompte(TypeCompteDTO));
  }

  static async addPiece(pieceComptable: OperationDiverseToSave): Promise<number> {
    const response = await api.AcQuaCore.post<number>(`/OperationDiverse/AddPieceComptable`, pieceComptable);
    return response.data;
  }

  static async deletePieceComptable(periode: string, numeroJournal: number, numeroPiece: number): Promise<boolean> {
    await api.AcQuaCore.delete<any>(
      `OperationDiverse/DeletePieceComptable?periode=${periode}&journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return true;
  }

  static async updatePieceComptable(pieceComptable: OperationDiverseToSave): Promise<OperationDiverseToSave> {
    const response = await api.AcQuaCore.put<OperationDiverseToSave>(
      `/OperationDiverse/UpdatePieceComptable`,
      pieceComptable
    );
    return response.data;
  }

  static async changeNumero(periode: string, journal: number, oldNumero: number, newNumero: number): Promise<boolean> {
    await api.AcQuaCore.put(
      `/OperationDiverse/ChangementNumero?periode=${periode}&numeroJournal=${journal}&ancienNumeroPiece=${oldNumero}&nouveauNumeroPiece=${newNumero}`
    );
    return true;
  }
}
