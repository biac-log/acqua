import { Permission } from './Permission';

export interface IUtilisateur { 
    ID: string;
    NomPrenom: string;
    Email: string;
    Departement: string;    
    MotDePasseApollo: string;    
    IdActiveDirectory: string;
    Fonction: string;    
    Langue: string;    
    Adresse: string;    
    AdresseLigne1: string;    
    AdresseLigne2: string;    
    AdresseLigne3: string;    
    Telephone: string;    
    TelephoneInterne: string;    
    Fax: string;    
    Photo: string;
    PhotoExtension: string;
    Permissions: Permission[]
  }
    
  export class UtilisateurDTO implements IUtilisateur{
    ID = "";
    NomPrenom = "";
    Email = "";
    Departement = "";   
    MotDePasseApollo = "";    
    IdActiveDirectory = "" 
    Fonction = "";    
    Langue = "";   
    Adresse = ""; 
    AdresseLigne1 = "";    
    AdresseLigne2 = "";    
    AdresseLigne3 = "";    
    Telephone = "";   
    TelephoneInterne = "";    
    Fax = "";    
    Photo = "";
    PhotoExtension = "";
    Permissions: Permission[] = []
  }
    
  export class Utilisateur extends UtilisateurDTO {
    constructor(dto?: UtilisateurDTO) {
      super();
      Object.assign(this, dto || new UtilisateurDTO());
    } 

    get HasEmail(): boolean{
      return !!this.Email
    }

    get Applications(): string{
      return "App";
    }

    get Permission(): string{
        return this.Permissions?.map(e => e.Nom).join(', ') 
    }
  }