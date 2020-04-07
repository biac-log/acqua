<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary"
        fab
        small
        class="ml-5"
        v-on="on"
        :disabled="readonly"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-form ref="form" v-model="isValid">
      <v-card>
        <v-card-title>
          Contrepartie
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-select
                :items="typesComptes"
                v-model="typesComptesSelected"
                label="Type compte"
                :readonly="readonly"
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field
                :value="numeroCompte"
                label="N° compte"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                ref="firstElement"
                :value="nomCompte"
                label="Nom compte"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :value="libelle"
                label="Libelle"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                :items="devises"
                v-model="devisesSelected"
                label="Devise"
                :readonly="readonly"
              ></v-select>
            </v-col>
            <v-col>
              <v-select
                :items="typesMouvements"
                v-model="typesMouvementsSelected"
                label="Type de mouvement"
                :readonly="readonly"
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field
                :value="montant"
                label="Montant"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :value="caseTva"
                label="Case TVA"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                :value="reference"
                label="Référence"
                :readonly="readonly"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false"
            >Fermer</v-btn
          >
          <v-btn color="success" text @click="dialog = false" v-if="!readonly"
            >Valider</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit, Prop } from "vue-property-decorator";
import PieceComptableContrepartie from "@/models/AchatVente/PieceComptableContrepartie";
import { AchatVenteApi } from "@/api/AchatVenteApi";
import axios from "axios";

@Component({
  name: "EditContrepartie"
})
export default class extends Vue {
  public dialog: boolean = false;
  @PropSync("isReadOnly")
  public readonly!: boolean;
  public isValid: boolean = false;
  private resolve!: any;
  private reject!: any;

  public overlay: boolean = false;

  public typesComptes: string[] = ["General", "Bonjour"];
  public typesComptesSelected: string = "";
  private typesComptesRules: any = [(v: string) => !!v || "Type obligatoire"];
  public numeroCompte: string = "";
  private numeroCompteRules: any = [(v: string) => !!v || "Numéro obligatoire"];
  public nomCompte: string = "";
  private nomCompteRules: any = [(v: string) => !!v || "Nom obligatoire"];
  public devises: string[] = ["EUR", "DLRS"];
  public devisesSelected: string = "";
  private deviseRules: any = [(v: string) => !!v || "Devise obligatoire"];
  public libelle: string = "";
  private libelleRules: any = [(v: string) => !!v || "Libelle obligatoire"];
  public typesMouvements: string[] = ["Débit", "Crédit"];
  public typesMouvementsSelected: string = "";
  private typesMouvementsRules: any = [
    (v: string) => !!v || "Type obligatoire"
  ];
  public montant: string = "";
  private montantRules: any = [(v: string) => !!v || "Montant obligatoire"];
  public caseTva: string = "";
  private caseTvaRules: any = [(v: string) => !!v || "Case tva obligatoire"];
  public reference: string = "";
  private referenceRules: any = [(v: string) => !!v || "Référence obligatoire"];

  public open(
    compte: PieceComptableContrepartie
  ): Promise<PieceComptableContrepartie> {
    this.dialog = true;

    this.typesComptesSelected = compte.typeCompte;
    this.devisesSelected = compte.libelleDevise;

    this.numeroCompte = compte.numeroCompte.toString();
    this.libelle = compte.compteLibelle;
    this.typesMouvementsSelected = compte.codeMouvement;
    this.montant = compte.montantBase.toString();
    this.caseTva = compte.numeroCase.toString();

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private GetModel(): PieceComptableContrepartie {
    let contrepartie = new PieceComptableContrepartie();

    contrepartie.typeCompte = this.typesComptesSelected;
    //contrepartie.numeroCompte = this.numeroCompte;
    contrepartie.compteLibelle = this.nomCompte;
    contrepartie.libelle = this.libelle;
    contrepartie.codeMouvement = this.typesComptesSelected;
    //contrepartie.montantDevise = this.devisesSelected;
    //contrepartie.montantBase = this.montant;
    //contrepartie.codeDevise = this.devisesSelected;
    contrepartie.libelleDevise = this.devisesSelected;
    //contrepartie.numeroCase = this.caseTva;
    contrepartie.libelleCase = this.caseTva;

    return contrepartie;
  }

  private sendContrepartie(compte: PieceComptableContrepartie) {
    this.dialog = false;
    this.resolve(this.GetModel());
  }

  private close() {
    this.dialog = false;
    this.reject();
  }
}
</script>

<style></style>
