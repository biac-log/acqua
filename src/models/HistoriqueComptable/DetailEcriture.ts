import { ImputationDetail } from "./ImputationDetail";

export class DetailEcritureDTO {
    periode = '';
    codeJournal = 0;
    codePiece = 0;
    imputations: ImputationDetail[] = [];
}

export class DetailEcriture extends DetailEcritureDTO {
  constructor(dto?: DetailEcritureDTO) {
    super();
    Object.assign(this, dto || new DetailEcritureDTO());
    if (dto) {
      this.imputations = [];
      dto.imputations.forEach((element) => {
        this.imputations.push(new ImputationDetail(element));
      });
    }
  }
}
