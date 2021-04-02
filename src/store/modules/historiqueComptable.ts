import { VuexModule, Module, Mutation, Action, getModule, MutationAction } from 'vuex-module-decorators';
import store from '@/store';
import { HistoriqueComptable } from '@/models/HistoriqueComptable/HistoriqueComptable';
import HistoriqueComptableApi from '@/api/HistoriqueComptableApi';
import { HistoriqueInput } from '@/models/HistoriqueComptable/HistoriqueInput';
import { TypeCompte } from '@/models/AchatVente';
import { DateTime } from '@/models/DateTime';
import { LigneReport } from '@/models/HistoriqueComptable/LigneReport';

export interface IHistoriqueState {
  historique: HistoriqueComptable;
  reportMensuel: LigneReport[];
  reportJournalier: LigneReport[];
}

@Module({ dynamic: true, store, name: 'historique' })
class HistoriqueMod extends VuexModule implements IHistoriqueState {
  public historique = new HistoriqueComptable();
  public reportMensuel: LigneReport[] = [];
  public reportJournalier: LigneReport[] = [];

  // Inputs de recherche
  public typeCompteSelected = new TypeCompte();
  public numeroCompte = '';
  public fromDate = '';
  public toDate = '';

  public mode = 'historique';

  /** Mutations  **/

  @Mutation
  private setHistorique(historique: HistoriqueComptable) {
    this.historique = historique;
  }

  @Mutation
  private resetHistorique() {
    this.historique = new HistoriqueComptable();
  }

  @Mutation
  public setFromDate(date: string) {
    this.fromDate = date;
    this.loadDatas();
  }

  @Mutation
  public setToDate(date: string) {
    this.toDate = date;
    this.loadDatas();
  }

  @Mutation
  public setNumeroCompte(numero: string) {
    this.numeroCompte = numero;
    if (numero) this.loadDatas();
  }

  @Mutation
  public setTypeCompte(typeCompte: TypeCompte) {
    this.typeCompteSelected = typeCompte;
  }

  @Mutation
  public setMode(mode: string) {
    this.mode = mode;
    this.loadDatas();
  }

  @Mutation
  public setReportMensuel(report: LigneReport[]) {
    this.reportMensuel = report;
  }

  @Mutation
  public setReportJournalier(report: LigneReport[]) {
    this.reportJournalier = report;
  }

  /** Actions */
  @Action({ rawError: true })
  async fetchHistorique() {
    const input: HistoriqueInput = {
      typeCompte: this.typeCompteSelected.id,
      numeroCompte: +this.numeroCompte,
      startDate: this.fromDate,
      endDate: this.toDate
    };
    this.resetHistorique();
    const historique = await HistoriqueComptableApi.getHistorique(input);

    this.setFromDate(historique.fromDate.toString());
    this.setToDate(historique.toDate.toString());
    this.setHistorique(historique);
  }

  @Action
  async fetchReportMensuel() {
    const reportMensuel = await HistoriqueComptableApi.getReportMensuel(
      this.typeCompteSelected.id,
      +this.numeroCompte,
      this.fromDate,
      this.toDate
    );

    this.setReportMensuel(reportMensuel);
  }

  @Action
  async fetchReportJournalier() {
    const reportJournalier = await HistoriqueComptableApi.getReportJournalier(
      this.typeCompteSelected.id,
      +this.numeroCompte,
      this.fromDate,
      this.toDate
    );

    this.setReportJournalier(reportJournalier);
  }

  // /** Getters */

  private get canLoadDatas() {
    return this.typeCompteSelected.id != '' && this.numeroCompte;
  }

	@Action
  async loadDatas() {
    if (this.canLoadDatas) {
      if (this.mode == 'historique') {
        this.fetchHistorique();
      } else if (this.mode == 'reportMensuel') {
        this.fetchReportMensuel();
      } else if (this.mode == 'reportJournalier') {
        this.fetchReportJournalier();
      } else {
        console.log('Invalid mode');
      }
      // this.page = 1;
    }
  }
}

export const HistoriqueModule = getModule(HistoriqueMod);
