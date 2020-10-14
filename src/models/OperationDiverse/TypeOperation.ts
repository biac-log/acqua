//3:Facture, 5:Paiement, 6:Acompte, 7:N.C, 8:N.C.Annulation facture

export default class TypeOperation {
  public numero = 0;
  public libelle = '';

  public static getAllOperations(): TypeOperation[] {
    return [
      { numero: 3, libelle: 'Facture' },
      { numero: 5, libelle: 'Paiement' },
      { numero: 6, libelle: 'Acompte' },
      { numero: 7, libelle: 'N.C' },
      { numero: 8, libelle: 'N.C.Annulation facture' }
    ];
  }
}
