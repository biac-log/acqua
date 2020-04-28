import { JsonObject, JsonProperty } from "json2typescript";
// import { Permission } from "./Permission";

@JsonObject("Permission")
export class Permission {
  @JsonProperty("Id", String)
  public Id: string = '';
  @JsonProperty("Nom", String)
  public Nom: string = '';
  @JsonProperty("Description", String)
  public Description: string = '';
  @JsonProperty("ApplicationId", String)
  public ApplicationId: string = '';
}

@JsonObject("Utilisateur")
export class Utilisateur {
  @JsonProperty("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", String)
  public ID: string = '';
  @JsonProperty("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname", String)
  public NomPrenom: string = '';
  @JsonProperty("Permission", [Permission])
  public Permissions: Permission[] = [];
  @JsonProperty("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", [Permission])
  public Perms: string[] = [];
}