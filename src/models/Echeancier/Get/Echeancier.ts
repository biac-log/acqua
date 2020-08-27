import { EcheancierElement } from './EcheancierElement';
export class EcheancierDTO {
  typeCompte = '';
  numeroCompte = 0;
  nomCompte = '';
  adresseLigne1 = '';
  adresseLigne2 = '';
  codePostal = '';
  codePays = '';
  localite = '';
  solde = 0;
  elements: EcheancierElement[] = [];
}

export class Echeancier extends EcheancierDTO {
  constructor(dto?: EcheancierDTO) {
    super();
    Object.assign(this, dto || new EcheancierDTO());
    if (dto) {
      this.elements = [];
      dto.elements?.forEach((element) => {
        this.elements.push(new EcheancierElement(element));
      });
    }
  }
}
