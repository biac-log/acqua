export class CodeItem {
  public code!: string | number;
  public nom = '';
  public numeroNom = '';

  constructor(code: string | number, nom: string) {
    this.code = code != '0' ? code : '';
    this.nom = nom;
    this.numeroNom = `${this.code} - ${this.nom}`;
  }
}
