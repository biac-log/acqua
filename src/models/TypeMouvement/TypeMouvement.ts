export interface ITypeMouvement {
  id: string;
  libelle: string;
}

export class TypeMouvementDTO implements ITypeMouvement {
  id = '';
  libelle = '';
}

export class TypeMouvement extends TypeMouvementDTO {
  constructor(dto?: TypeMouvementDTO) {
    super();
    Object.assign(this, dto || new TypeMouvementDTO());
  }
}

export const getTypesMouvements = (): TypeMouvement[] => {
  return [new TypeMouvement({ id: 'DB', libelle: 'Débit' }), new TypeMouvement({ id: 'CR', libelle: 'Crédit' })];
};
