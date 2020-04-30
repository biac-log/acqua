import { JsonObject, JsonProperty } from "json2typescript";
// import { Permission } from "./Permission";

@JsonObject("Utilisateur")
export class Utilisateur {
  @JsonProperty("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", String)
  public ID: string = '';
  @JsonProperty("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname", String)
  public NomPrenom: string = '';
  @JsonProperty("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", [String])
  public Permissions: string[] = [];
}