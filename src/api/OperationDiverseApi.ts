import api from '@/api/AxiosApi';
import { EntetePieceComptable, Journal, JournalDTO } from '@/models/OperationDiverse';
import { PeriodeComptable, PeriodeComptableDTO } from '@/models/OperationDiverse/PeriodeComptable';
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
}
// http://localhost:5000/OperationDiverse/GetEntetePiecesComptables?Page=1&Limit=10&Term=&SortBy=&SortByAsc=&NumeroJournal=91&Periode=courante
// http://localhost:5000/OperationDiverse/GetEntetePiecesComptables?Page=1&Limit=10&NumeroJournal=91&Periode=courantez
