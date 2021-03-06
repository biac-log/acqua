import {
  PieceComptableDTO,
  PieceComptable,
  TypeCompte,
  TypeCompteDTO,
  CompteContrepartieSearchDTO,
  CompteContrepartieSearch,
  PeriodeComptableDTO,
  PeriodeComptable,
  EntetePieceComptable,
  Statut,
  Journal,
  JournalDTO,
  PieceComptableSaveDTO
} from '@/models/AchatVente';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import { DateTime } from '@/models/DateTime';
import { PaginationResult } from '@/models/PaginationResult';
import { Pagination } from '@/models/Pagination';
import api from '@/api/AxiosApi';

export default class AchatVenteApi {
  static async getPeriodes(): Promise<PeriodeComptable[]> {
    const responseCourante = await api.AcQuaCore.get<PeriodeComptableDTO>(`/AchatVente/GetPeriodeCourante`);
    const responsePrecedente = await api.AcQuaCore.get<PeriodeComptableDTO>(`/AchatVente/GetPeriodePrecedente`);
    const periodes: PeriodeComptable[] = [];
    periodes.push(new PeriodeComptable(responseCourante.data));
    periodes.push(new PeriodeComptable(responsePrecedente.data));
    return periodes;
  }

  static async getJournaux(): Promise<Journal[]> {
    const response = await api.AcQuaCore.get<JournalDTO[]>(`/AchatVente/GetJournaux`);
    return response.data.map((journal) => new Journal(journal));
  }

  static async getEntetePiecesComptables(
    numeroJournal: number,
    periode: string,
    pagination: Pagination
  ): Promise<PaginationResult<EntetePieceComptable>> {
    const response = await api.AcQuaCore.get<PaginationResult<EntetePieceComptable>>(
      `/AchatVente/GetEntetePiecesComptables?Page=${pagination.page}&Limit=${pagination.limit}&Term=${pagination.terms}&SortBy=${pagination.sortBy}&SortByAsc=${pagination.sortDesc}&NumeroJournal=${numeroJournal}&Periode=${periode}`
    );
    return response.data;
  }

  static async getDateEcheance(typeCompte: string, numeroCompte: number | string, date: DateTime): Promise<DateTime> {
    const response = await api.AcQuaCore.get<string>(
      `/AchatVente/GetDateEcheance?typeCompte=${typeCompte}&numeroCompte=${numeroCompte}&datePiece=${date.toUtc()}`
    );
    return new DateTime(response.data);
  }

  static async getPieceComptable(
    numeroJournal: string | number,
    numeroPiece: string | number
  ): Promise<PieceComptable> {
    const response = await api.AcQuaCore.get<PieceComptableDTO>(
      `/AchatVente/GetPieceComptable?journal=${numeroJournal}&piece=${numeroPiece}`
    );
    return new PieceComptable(response.data);
  }

  static async getTypesComptes(): Promise<TypeCompte[]> {
    const response = await api.AcQuaCore.get<TypeCompteDTO[]>(`/AchatVente/GetTypesCompteContreparties`);
    return response.data.map((dto) => new TypeCompte(dto));
  }

  static async getComptesContreparties(): Promise<CompteContrepartieSearch[]> {
    const response = await api.AcQuaCore.get<CompteContrepartieSearchDTO[]>(`/AchatVente/GetTypesCompteContreparties`);
    return response.data.map((dto) => new CompteContrepartieSearch(dto));
  }

  static async getAllStatut(): Promise<Statut[]> {
    const response = await api.AcQuaCore.get<Statut[]>(`AchatVente/GetStatuts`);
    return response.data;
  }

  static async getCompteTva(
    numeroJournal: number | string,
    codeTaxe: string | number,
    codePays?: string
  ): Promise<CompteGeneralSearch> {
    const response = await api.AcQuaCore.get<CompteGeneralSearch>(
      `/AchatVente/GetCompteTVA?numeroJournal=${numeroJournal}&codePays=${codePays}&codeTaxeCompteTiers=${codeTaxe}`
    );
    return response.data;
  }

  static async addPiece(pieceComptable: PieceComptableSaveDTO): Promise<number> {
    const response = await api.AcQuaCore.post<number>(`/AchatVente/AddPieceComptable`, pieceComptable);
    return response.data;
  }

  static async updatePiece(pieceComptable: PieceComptableSaveDTO): Promise<PieceComptableSaveDTO> {
    const response = await api.AcQuaCore.put<PieceComptableSaveDTO>(`/AchatVente/UpdatePieceComptable`, pieceComptable);
    return response.data;
  }

  static async deletePiece(periode: string, journal: number, piece: number): Promise<any> {
    const response = await api.AcQuaCore.delete<any>(
      `/AchatVente/DeletePieceComptable?periode=${periode}&journal=${journal}&piece=${piece}`
    );
    return response.data;
  }

  static async validateLibelle(libelle: string, typeComte: string, numeroCompte: string | number): Promise<number> {
    const response = await api.AcQuaCore.get<number>(
      `/AchatVente/IsReferenceExiste?typeCompte=${typeComte}&numeroCompte=${numeroCompte}&reference=${libelle}`
    );
    return response.data;
  }

  static async changeNumero(periode: string, journal: number, oldNumero: number, newNumero: number): Promise<boolean> {
    await api.AcQuaCore.put(
      `/AchatVente/ChangementNumero?periode=${periode}&numeroJournal=${journal}&ancienNumeroPiece=${oldNumero}&nouveauNumeroPiece=${newNumero}`
    );
    return true;
  }
}
