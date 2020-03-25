import { JsonObject, JsonProperty } from "json2typescript";
// import { Permission } from "./Permission";

@JsonObject("Utilisateur")
export class Utilisateur {
  @JsonProperty("ID", String)
  public ID: string = '';
  @JsonProperty("NomPrenom", String)
  public NomPrenom: string = '';
  // @JsonProperty("Permissions", [Permission])
  // public Permissions: Permission[] = [];
}