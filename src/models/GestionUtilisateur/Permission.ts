export interface IPermission {
  ApplicationId: string;
  Nom: string;
  Description: string;
  Id: string;
}

export class PermissionDTO implements IPermission {
  Id = '';
  Nom = '';
  Description = '';
  ApplicationId = '';
}

export class Permission extends PermissionDTO {
  constructor(dto: PermissionDTO) {
    super();
    Object.assign(this, dto);
  }
}
