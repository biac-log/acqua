import { Permission } from './Permission';
import { Application, ApplicationDTO } from './Application';

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
    Applications: Application[]
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
    Applications: Application[] = []
  }
    
  export class Utilisateur extends UtilisateurDTO {
    constructor(dto?: UtilisateurDTO) {
      super();
      Object.assign(this, dto || new UtilisateurDTO());
    } 

    get HasEmail(): boolean{
      return !!this.Email
    }

    get ApplicationsList(): string[]{
      const appIds = this.Permissions?.map(e => e.ApplicationId).filter(
        this.onlyUnique
      );
      const appNames: string[] = [];
  
      appIds.forEach(element => {
        const app = this.Applications.find(e => e.Id === element);
        if (app) appNames.push(app.Nom);
      });
      return appNames;
    }

    get ApplicationsNom(): string{
      
      return this.ApplicationsList.join(', ');
    }

    get Permission(): string{
        return this.Permissions?.map(e => e.Nom).join(', ') 
    }

    private onlyUnique(value: any, index: any, self: any) {
      return self.indexOf(value) === index;
    }
  }
  