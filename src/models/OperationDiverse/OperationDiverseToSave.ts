import { OperationDiverseImputationToSave } from './OperationDiverseImputationToSave';

export class OperationDiverseToSave {
  numeroJournal = 0;
  numeroPiece = 0;
  periode = '';
  codeDeviseJournal = '';
  libellePiece = '';
  datePiece: Date | string = '';
  imputations: OperationDiverseImputationToSave[] = [];
  hash = '';
}
