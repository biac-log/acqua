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
  @JsonProperty("ID", String)
  public ID: string = '';
  @JsonProperty("NomPrenom", String)
  public NomPrenom: string = '';
  @JsonProperty("Permissions", [Permission])
  public Permissions: Permission[] = [];
}