<template>
  <v-dialog
    v-model="display"
    @click:outside="clickOutside"
    @keydown.f2.stop="modifierFournisseur"
    @keydown.esc.prevent="cancelEdit()"
    @keydown.alt.enter.stop="saveFournisseur()"
    :persistent="!readonly || saveLoading || deleteLoading"
    ref="fournisseurDialog"
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-card-title>{{ newRecord ? 'Nouveau fournisseur' : `${numero} - ${nom}` }}</v-card-title>
        <v-spacer></v-spacer>
        <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn class="mr-5" color="success" :disabled="isLoading" @click="modifierFournisseur" v-on="on">
              <v-icon left>mdi-pencil</v-icon>Modifier
            </v-btn>
          </template>
          <span>
            Modifier le fournisseur
            <span class="shortcutTooltip">F2</span>
          </span>
        </v-tooltip>
        <!-- <v-tooltip v-if="readonly && !newRecord" top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              class="mr-10"
              color="error"
              :disabled="saveLoading"
              @click="deleteFournisseur"
              :loading="deleteLoading"
            >
              <v-icon left>mdi-delete</v-icon>Supprimer
            </v-btn>
          </template>
          <span>
            Supprimer la pièce
            <span class="shortcutTooltip">del</span>
          </span>
        </v-tooltip> -->
        <v-btn ref="buttonClose" class="ml-10" icon color="white" @click="closeDialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate top color="primary accent-4"></v-progress-linear>
      <v-card-text>
        <AlertMessageVue ref="alertMessage" class="alertMessage" type="warning" />
        <AlertMessageVue ref="successMessage" class="alertMessage" type="success" />
        <v-form ref="form" v-model="isValid" lazy-validation>
          <fieldset id="signaletique">
            <legend>Signalétique</legend>
            <v-row dense>
              <v-col sm="6" lg="3" class="pr-3">
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field
                      autofocus
                      label="Nom"
                      ref="inputNom"
                      v-model="nom"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="23"
                      dense
                      :hide-details="readonly"
                      :rules="rules.nom"
                      validate-on-blur
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Match code"
                      v-model="matchCode"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="23"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Numéro"
                      v-model="numero"
                      outlined
                      :readonly="numeroReadonly"
                      :tabindex="numeroReadonly ? -1 : null"
                      dense
                      :hide-details="numeroReadonly"
                      :append-icon="readonly ? '' : 'mdi-pencil'"
                      @click:append="numeroReadonly = !numeroReadonly"
                      @blur="checkNumeroExists"
                      ref="numeroInput"
                      :error-messages="numeroErrors"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Raison sociale"
                      v-model="raisonSociale"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="11"
                      dense
                      :hide-details="readonly"
                      ref="raisonInput"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="E-mail"
                      v-model="email"
                      outlined
                      :readonly="readonly"
                      dense
                      :hide-details="readonly"
                      type="email"
                      :rules="rules.email"
                      validate-on-blur
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" class="pr-3 pl-3">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      label="Adresse"
                      v-model="adresseLigne1"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="35"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Complément d'adresse"
                      v-model="adresseLigne2"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="35"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Code Postal"
                      v-model="codePostal"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="8"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Localité"
                      v-model="localité"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="30"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      label="Pays"
                      v-model="codePays"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="3"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" class="pr-3 pl-3">
                <v-row dense>
                  <v-col cols="6" class="input-spacing">
                    <v-text-field
                      label="Téléphone"
                      v-model="numeroTelephone"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="14"
                      dense
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="Fax"
                      v-model="téléfax"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="14"
                      dense
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="GSM"
                      v-model="gsm"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="14"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="6" class="input-spacing">
                    <v-text-field
                      label="Contact 1"
                      v-model="contact1"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="30"
                      dense
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="Contact 2"
                      v-model="contact2"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="30"
                      dense
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="Contact 3"
                      v-model="contact3"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="30"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" class="pl-3">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      label="Commentaire 1"
                      v-model="commentaire1"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="20"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Commentaire 2"
                      v-model="commentaire2"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="20"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      label="Commentaire 3"
                      v-model="commentaire3"
                      outlined
                      :readonly="readonly"
                      :counter="!readonly"
                      maxlength="20"
                      dense
                      :hide-details="readonly"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </fieldset>
          <v-row dense>
            <v-col sm="12" lg="6">
              <fieldset id="comptabilite">
                <legend>Comptabilité</legend>
                <v-row dense>
                  <v-col cols="6" :class="readonly ? 'input-spacing' : ''">
                    <autocomplete-comptes-vue
                      :readonly.sync="readonly"
                      typeCompte.sync="G"
                      label="N° de compte associé"
                      @change="setCompteAssocie"
                      v-model="compteAssocie"
                      ref="autocompleteCompteAssocie"
                      :hide-details.sync="readonly"
                      outlined
                      :rules="[]"
                    />
                    <autocomplete-comptes-vue
                      :readonly="readonly"
                      typeCompte="C"
                      label="N° de compte maître"
                      ref="autocompleteCompteMaitre"
                      @change="setCompteMaitre"
                      :hide-details="readonly"
                      outlined
                      :rules="[]"
                    />
                    <autocomplete-comptes-vue
                      :readonly="readonly"
                      typeCompte="G"
                      label="N° de compte vente/achat"
                      @change="setCompteVenteAchat"
                      ref="autocompleteCompteVenteAchat"
                      :hide-details="readonly"
                      outlined
                      :rules="[]"
                    />
                  </v-col>
                  <v-col cols="3" class="pl-3" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      label="IBAN"
                      v-model="compte"
                      outlined
                      :readonly="readonly"
                      :hide-details="readonly"
                      ref="ibanField"
                    />
                    <v-select
                      label="Code suivis"
                      :readonly="readonly"
                      outlined
                      :items="codeSuivis"
                      item-text="valeur"
                      item-value="code"
                      v-model="typeSuivis"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="N° domiciliation"
                      v-model="numeroDomiciliation"
                      outlined
                      :readonly="readonly"
                      maxlength="12"
                      :counter="!readonly"
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="3" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      label="BIC"
                      v-model="bic"
                      outlined
                      :readonly="readonly"
                      @blur="setBic"
                      minlength="8"
                      maxlength="11"
                      :counter="!readonly"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      label="Code ventilation"
                      v-model="codeVentilation"
                      outlined
                      :readonly="readonly"
                      maxlength="1"
                      :hide-details="readonly"
                      :rules="rules.codeVentilation"
                      validate-on-blur
                    />
                    <v-checkbox
                      :readonly="readonly"
                      v-model="operationsTriangulaires"
                      label="Op. triangulaires ?"
                      :hide-details="true"
                      dense
                    />
                  </v-col>
                  <v-col cols="3" :class="`pt-0 correct-alignment-top ${readonly ? 'correct-alignment-bottom' : ''}`">
                    <v-select
                      label="Code devise"
                      :readonly="readonly"
                      outlined
                      :items="devises"
                      item-text="libelle"
                      item-value="id"
                      v-model="codeDevise"
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col
                    cols="3"
                    :class="`pr-3 pt-0 correct-alignment-top ${readonly ? 'correct-alignment-bottom' : ''}`"
                  >
                    <v-select
                      label="Code assujetti"
                      v-model="codeAssujetti"
                      :items="libellesAssujettis"
                      item-text="valeur"
                      item-value="code"
                      @change="checkSaisieIntra()"
                      :readonly="readonly"
                      outlined
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col
                    cols="2"
                    :class="`pl-3 pt-0 correct-alignment-top ${readonly ? 'correct-alignment-bottom' : ''}`"
                  >
                    <v-text-field
                      label="Code Pays"
                      v-model="intraCodePays"
                      outlined
                      :readonly="readonly || intraSaisieReadonly"
                      :disabled="intraSaisieReadonly"
                      :counter="!readonly"
                      maxlength="2"
                      :hide-details="readonly"
                    />
                  </v-col>
                  <v-col cols="4" :class="`pt-0 correct-alignment-top ${readonly ? 'correct-alignment-bottom' : ''}`">
                    <v-text-field
                      label="N° Intracommunautaire"
                      v-model="intraIdentification"
                      outlined
                      :readonly="readonly || intraSaisieReadonly"
                      :disabled="intraSaisieReadonly"
                      :counter="!readonly"
                      maxlength="18"
                      :hide-details="readonly"
                    />
                  </v-col>
                </v-row>
              </fieldset>
            </v-col>
            <v-col sm="12" lg="6">
              <fieldset id="commercial">
                <legend>Commercial</legend>
                <v-row dense>
                  <v-col cols="2" :class="readonly ? 'input-spacing' : ''">
                    <autocomplete-code-vue
                      ref="autocompleteCodeRepresentant"
                      label="Code représentant"
                      :readonly.sync="readonly"
                      typeCode="codeRepresentant"
                      v-model="codeRepresentant"
                      @select="selectRepresentant"
                      :hide-details="readonly"
                    />
                    <autocomplete-code-vue
                      ref="autocompleteCodeFamille"
                      label="Code famille"
                      :readonly.sync="readonly"
                      typeCode="codeFamille"
                      v-model="codeFamille"
                      @select="selectFamille"
                      :hide-details="readonly"
                      dense
                    />
                    <autocomplete-code-vue
                      ref="autocompleteCodeSecteur"
                      label="Code secteur"
                      :readonly.sync="readonly"
                      typeCode="codeSecteur"
                      v-model="codeSecteur"
                      @select="selectSecteur"
                      :hide-details="readonly"
                      dense
                    />
                    <v-text-field
                      outlined
                      label="Nombre de jours"
                      v-model="nombreDeJoursPaiement"
                      :hide-details="readonly"
                      :rules="rules.nombreDeJoursPaiement"
                      validate-on-blur
                    />
                  </v-col>
                  <v-col cols="4" class="pr-3" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      outlined
                      readonly
                      tabindex="-1"
                      v-model="nomRepresentant"
                      :hide-details="readonly"
                      label="Nom représentant"
                    />
                    <v-text-field
                      outlined
                      readonly
                      tabindex="-1"
                      v-model="nomFamille"
                      :hide-details="readonly"
                      label="Nom famille"
                    />
                    <v-text-field
                      outlined
                      readonly
                      tabindex="-1"
                      v-model="nomSecteur"
                      :hide-details="readonly"
                      label="Nom secteur"
                    />
                    <v-select
                      outlined
                      :readonly="readonly"
                      label="Paiement"
                      v-model="codePaiement"
                      :items="codesPaiement"
                      item-text="code"
                      item-value="code"
                      @change="changeCodePaiement"
                      :hide-details="readonly"
                      ref="paiementField"
                    />
                  </v-col>
                  <v-col cols="2" class="pl-3" :class="readonly ? 'input-spacing' : ''">
                    <v-select
                      label="Langue"
                      v-model="codeLangue"
                      item-value="code"
                      item-text="valeur"
                      :items="codesLangues"
                      outlined
                      :readonly="readonly"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      outlined
                      label="Escompte"
                      v-model="escompte"
                      append-icon="mdi-percent-outline"
                      :readonly="readonly"
                      :hide-details="readonly"
                      :rules="rules.escompte"
                      validate-on-blur
                    />
                    <v-text-field
                      outlined
                      label="Remise"
                      v-model="codeRemise"
                      :readonly="readonly"
                      :hide-details="readonly"
                    />
                    <div>
                      <date-picker
                        label="Fermeture du"
                        :date.sync="fermetureDu"
                        :readonly.sync="readonly"
                        outlined
                        :rules.sync="fermetureDuRules"
                        :hide-details="readonly"
                        validate-on-blur
                      />
                    </div>
                  </v-col>
                  <v-col cols="2" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      outlined
                      label="Numéro prix"
                      v-model="codePrix"
                      :readonly="readonly"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      outlined
                      label="Jours"
                      v-model="joursEscomptes"
                      :readonly="readonly"
                      :hide-details="readonly"
                      :rules="rules.codeVentilation"
                      validate-on-blur
                    />
                    <v-text-field
                      outlined
                      label="Remise Globale"
                      v-model="remiseGlobaleDefaut"
                      append-icon="mdi-percent-outline"
                      :readonly="readonly"
                      :hide-details="readonly"
                      :rules="rules.remiseGlobaleDefaut"
                      validate-on-blur
                    />
                    <div>
                      <date-picker
                        id="fermetureAu"
                        label="au"
                        :date.sync="fermetureAu"
                        :readonly.sync="readonly"
                        outlined
                        :rules.sync="fermetureAuRules"
                        :hide-details="readonly"
                        class="pt-8"
                      />
                    </div>
                  </v-col>
                  <v-col cols="2" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      outlined
                      label="NACE"
                      v-model="codeNace"
                      maxlength="5"
                      :readonly="readonly"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      outlined
                      label="Tarif"
                      v-model="tarif"
                      maxlength="6"
                      :readonly="readonly"
                      :hide-details="readonly"
                    />
                    <v-text-field
                      outlined
                      label="Port Franco"
                      v-model="francoMontant"
                      append-icon="mdi-currency-eur"
                      :readonly="readonly"
                      :hide-details="readonly"
                      :rules="rules.francoMontant"
                      validate-on-blur
                    />
                    <v-text-field
                      outlined
                      label="Limite de crédit"
                      v-model="limiteCredit"
                      append-icon="mdi-currency-eur"
                      :readonly="readonly"
                      :hide-details="readonly"
                      :rules="rules.limiteCredit"
                      validate-on-blur
                    />
                  </v-col>
                </v-row>
              </fieldset>
            </v-col>
          </v-row>
          <fieldset id="logistique">
            <legend>Logistique</legend>
            <v-row dense>
              <v-col sm="6" lg="3" dense>
                <v-row dense>
                  <v-col cols="6">
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-checkbox
                          label="Livraison globale"
                          v-model="livraisonGlobale"
                          :readonly="readonly"
                          v-on="on"
                          :hide-details="true"
                          dense
                        ></v-checkbox>
                      </template>
                      <span>Une livraison est effectuée si tous les articles d'une commande sont de stock</span>
                    </v-tooltip>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-checkbox
                          label="Facture certifiée"
                          v-model="documentCertifie"
                          v-on="on"
                          dense
                          :hide-details="true"
                        ></v-checkbox>
                      </template>
                      <span>Les factures émises reprendront une mention de CERTIFICATION</span>
                    </v-tooltip>
                  </v-col>
                  <v-col cols="6">
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-checkbox
                          label="Tenue back-orders"
                          v-model="tenueBackOrders"
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="true"
                        ></v-checkbox>
                      </template>
                      <span>Gestion des back-orders</span>
                    </v-tooltip>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-checkbox
                          label="Confirmation commande"
                          v-model="confirmationCommande"
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="true"
                        ></v-checkbox>
                      </template>
                      <span>Les back-orders sont gérés dans des documents externes</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" dense>
                <v-row dense>
                  <v-col cols="6" class="pl-3" :class="readonly ? 'input-spacing' : ''">
                    <v-select
                      label="Factures groupées"
                      v-model="facturesGroupees"
                      outlined
                      :readonly="readonly"
                      :items="facturesGroupeesItems"
                      item-value="code"
                      item-text="valeur"
                      dense
                      :hide-details="readonly"
                    ></v-select>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="Catégorie facturation"
                          v-model="categorieFacturation"
                          outlined
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                          maxlength="1"
                        ></v-text-field>
                      </template>
                      <span
                        >Ce code permet de regrouper les clients au niveau des lots de facturation
                        (hebdomadaires/mensuels/...)</span
                      >
                    </v-tooltip>
                  </v-col>
                  <v-col cols="6" class="pr-3" :class="readonly ? 'input-spacing' : ''">
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="# Copies factures"
                          v-model="nombreExemplaireFacture"
                          outlined
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                          :rules="rules.nombreExemplaireFacture"
                          validate-on-blur
                        ></v-text-field>
                      </template>
                      <span>Nombre de copies de factures à éditer en plus de l'original</span>
                    </v-tooltip>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="Code formulaire"
                          v-model="formulaire"
                          outlined
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                        ></v-text-field>
                      </template>
                      <span
                        >Ce code permet de dissocier la présentation des documents externes (Notes de
                        livraison/Factures/...)</span
                      >
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" dense class="pl-3 pr-3">
                <v-row dense>
                  <v-col cols="12" :class="readonly ? 'input-spacing' : ''">
                    <v-select
                      label="Transporteur"
                      v-model="transporteur"
                      outlined
                      :readonly="readonly"
                      :items="transporteurs"
                      item-text="transportFR"
                      item-value="id"
                      dense
                      :hide-details="readonly"
                    ></v-select>
                    <v-combobox
                      label="Tournées"
                      dense
                      outlined
                      :readonly="readonly"
                      chips
                      multiple
                      :hide-details="readonly"
                      v-model="tournees"
                      append-icon=""
                      :rules="rules.tournees"
                    ></v-combobox>
                  </v-col>
                </v-row>
              </v-col>
              <v-col sm="6" lg="3" class="pl-3">
                <v-row dense>
                  <v-col cols="6" :class="readonly ? 'input-spacing' : ''">
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="Période commandes"
                          v-model="periodiciteCommande"
                          outlined
                          :readonly="readonly"
                          :suffix="periodiciteCommande != '0' ? '' : 'semaines'"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                          :rules="rules.periodiciteCommande"
                          validate-on-blur
                        ></v-text-field>
                      </template>
                      <span>Nombre moyen de semaines entre deux commande</span>
                    </v-tooltip>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="Délai livraison"
                          v-model="delaiLivraison"
                          outlined
                          :readonly="readonly"
                          :suffix="delaiLivraison != '0' ? '' : 'jours'"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                          :rules="rules.delaiLivraison"
                          validate-on-blur
                        ></v-text-field>
                      </template>
                      <span>Nombre moyen de jours de délai de livraison</span>
                    </v-tooltip>
                  </v-col>
                  <v-col cols="6" :class="readonly ? 'input-spacing' : ''">
                    <v-text-field
                      label="Conditions transp."
                      v-model="conditionsTransport"
                      outlined
                      :readonly="readonly"
                      dense
                      :hide-details="readonly"
                    ></v-text-field>
                    <v-tooltip top open-delay="500">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          label="Emission documents"
                          outlined
                          :readonly="readonly"
                          v-on="on"
                          dense
                          :hide-details="readonly"
                          v-model="emissionDocuments"
                          maxlength="5"
                        ></v-text-field>
                      </template>
                      <span
                        >Le contenu de cette zone permet de piloter l'envoi de documents par courrier, fax et
                        e-mail</span
                      >
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </fieldset>
        </v-form>
      </v-card-text>
      <v-card-actions v-if="!readonly">
        <v-spacer />
        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              color="blue darken-1"
              class="ma-2 mt-0 pr-4 align-self-start"
              :disabled="saveLoading"
              tile
              outlined
              @click="cancelEdit()"
              tabindex="-1"
              v-on="on"
            >
              <v-icon left>mdi-close</v-icon>Annuler
            </v-btn>
          </template>
          <span>Annuler les modifications</span>
        </v-tooltip>

        <v-tooltip top open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              ref="btnValidate"
              v-on="on"
              class="ma-2 mt-0 pr-4 align-self-start"
              tile
              color="success"
              :loading="saveLoading"
              :disabled="deleteLoading"
              @click="saveFournisseur()"
              tabindex="17"
            >
              <v-icon left>mdi-content-save</v-icon>Sauvegarder
            </v-btn>
          </template>
          <span>
            Sauvegarder le fournisseur
            <span class="shortcutTooltip">alt + enter</span>
          </span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
    <SearchComptes ref="compteDialog"></SearchComptes>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { SearchFournisseur } from '@/models/Fournisseur/SearchFournisseur';
import { Fournisseur } from '@/models/Fournisseur/Get/Fournisseur';
import { UpdateFournisseur } from '@/models/Fournisseur/UpdateFournisseur';
import { FournisseurApi } from '@/api/FournisseurApi';
import { displayAxiosError } from '@/utils/ErrorMethods';
import AlertMessageVue from '@/components/AlertMessage.vue';
import { FournisseurParams, LibelleTiers, Transporteur } from '@/models/Fournisseur/Get/FournisseurParams';
import SearchComptes from './SearchComptes.vue';
import { CompteSearch } from '@/models/Compte/CompteSearch';
import AutocompleteComptesVue from '@/components/comptes/AutocompleteComptes.vue';
import AutocompleteCodeVue from '@/views/Maintenance/Fournisseurs/components/AutocompleteCode.vue';
import { CompteGeneralSearch } from '@/models/Compte/CompteGeneralSearch';
import { CompteDeTier } from '@/models/Compte/CompteDeTier';
import { Devise } from '@/models/Devise/Devise';
import DeviseApi from '@/api/DeviseApi';
import DatePicker from '@/components/DatePicker.vue';
import { DateTime } from '@/models/DateTime';

@Component({
  name: 'FournisseurVue',
  components: { AlertMessageVue, SearchComptes, AutocompleteComptesVue, AutocompleteCodeVue, DatePicker }
})
export default class FournisseurVue extends Vue {
  @Ref() readonly inputNom: any;
  @Ref() alertMessage!: AlertMessageVue;
  @Ref() successMessage!: AlertMessageVue;

  @Ref() autocompleteCompteAssocie!: AutocompleteComptesVue;
  @Ref() autocompleteCompteMaitre!: AutocompleteComptesVue;
  @Ref() autocompleteCompteVenteAchat!: AutocompleteComptesVue;
  @Ref() ibanField!: any;

  @Ref() autocompleteCodeRepresentant!: AutocompleteCodeVue;
  @Ref() autocompleteCodeFamille!: AutocompleteCodeVue;
  @Ref() autocompleteCodeSecteur!: AutocompleteCodeVue;
  @Ref() paiementField!: any;
  @Ref() fournisseurDialog!: any;

  private display = false;
  private isValid = true;

  private resolve: any;
  private reject: any;
  private reloadOnClose = false;

  private saveLoading = false;
  private deleteLoading = false;
  private getLoading = false;

  get isLoading() {
    return this.saveLoading || this.deleteLoading || this.getLoading;
  }

  private fournisseur: Fournisseur = new Fournisseur();
  private fournisseurBase: Fournisseur = new Fournisseur(); // Used for the reset method
  private fournisseurParams!: FournisseurParams;

  private rules = Fournisseur.rules;
  private numeroErrors: string[] = [];

  /// Fournisseur model
  private numero = '';
  private nom = '';
  private matchCode = '';
  private adresseLigne1 = '';
  private adresseLigne2 = '';
  private localité = '';
  private raisonSociale = '';
  private codePays = '';
  private codePostal = '';
  private contact1 = '';
  private contact2 = '';
  private contact3 = '';
  private numeroTelephone = '';
  private téléfax = '';
  private gsm = '';
  private email = '';
  private commentaire1 = '';
  private commentaire2 = '';
  private commentaire3 = '';
  private compteAssocie = 0;
  private nomCompteAssocie = '';
  private compteMaitre = 0;
  private nomCompteMaitre = '';
  private compteVenteAchat = 0;
  private nomCompteVenteAchat = '';
  private codeAssujetti = 0;
  private intraCodePays = '';
  private intraIdentification = '';
  private codeDevise = 0;
  private typeSuivis = 0;
  private compte = '';
  private banAdr = '';
  private banPays = '';
  private banVille = '';
  private banAgence = '';
  private operationsTriangulaires = false;
  private numeroDomiciliation = '';
  private codeVentilation = '';
  private codeRepresentant = '';
  private nomRepresentant = '';
  private codeFamille = '';
  private nomFamille = '';
  private codeSecteur = '';
  private nomSecteur = '';
  private codeNace = '';
  private codeLangue = 0;
  private libelleLangue = '';
  private codePaiement = ''; // FinDeMois
  private libellePaiement = '';
  private nombreDeJoursPaiement = '';
  private escompte = '';
  private joursEscomptes = '';
  private limiteCredit = '';
  private codePrix = '';
  private libellePrix = '';
  private tarif = '';
  private codeRemise = '';
  private libelleRemise = '';
  private remiseGlobaleDefaut = '';
  private francoMontant = '';
  private fermetureDu: DateTime = new DateTime();
  private fermetureAu: DateTime = new DateTime();
  private livraisonGlobale = false;
  private tenueBackOrders = false;
  private confirmationCommande = false;
  private documentCertifie = false;
  private facturesGroupees = '';
  private categorieFacturation = '';
  private nombreExemplaireFacture = '';
  private formulaire = '';
  private transporteur = 0;
  private periodiciteCommande = '';
  private delaiLivraison = '';
  private conditionsTransport = '';

  private readonly = true;
  private newRecord = false;
  private numeroReadonly = true;

  private libellesAssujettis: LibelleTiers[] = [];
  private intraSaisieReadonly = true;

  private devises: Devise[] = [];
  private deviseSelected: Devise = new Devise();

  private codeSuivis: LibelleTiers[] = [];

  private codesLangues: LibelleTiers[] = [];

  private codesPaiement: LibelleTiers[] = [];

  private facturesGroupeesItems: { code: string; valeur: string }[] = [
    { code: 'N', valeur: 'Jamais de regroupement' },
    { code: 'Y', valeur: 'Toujours' },
    { code: 'A', valeur: 'Par adresse de livraison' },
    { code: 'C', valeur: 'Par commande' }
  ];

  private transporteurs: Transporteur[] = [];

  public bic = '';

  private fermetureDuRules: any = [(v: string) => DateTime.isValid(v) || 'Date invalide'];

  private fermetureAuRules: any = [(v: string) => DateTime.isValid(v) || 'Date invalide'];

  private emissionDocuments = '';

  private tournees: string[] = [];

  mounted() {
    this.getDevises();
    this.getParams();
  }

  public open(searchFournisseur: SearchFournisseur): Promise<boolean> {
    this.numero = searchFournisseur.numero.toString();
    this.nom = searchFournisseur.nom;

    this.display = true;
    this.newRecord = false;
    this.reloadOnClose = false;

    this.loadFournisseur(searchFournisseur.numero);

    this.$nextTick(() => {
      (this.inputNom as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public async openNew(): Promise<number> {
    this.readonly = false;
    this.setFournisseur(new Fournisseur());
    this.fournisseurBase = new Fournisseur();
    this.newRecord = true;

    this.numero = this.fournisseurParams.nextNumero.toString();
    this.compteAssocie = this.fournisseurParams.numeroCompteAssocieDefaut;
    this.nomCompteAssocie = this.fournisseurParams.nomCompteAssocieDefaut;

    this.fournisseurBase.numero = this.fournisseurParams.nextNumero;
    this.fournisseurBase.compteAssocie = this.fournisseurParams.numeroCompteAssocieDefaut;

    this.display = true;
    this.$nextTick(() => {
      this.autocompleteCompteAssocie.init(
        this.fournisseurParams.numeroCompteAssocieDefaut.toString(),
        this.fournisseurParams.nomCompteAssocieDefaut
      );
      (this.inputNom as any).focus();
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  private setFournisseur(fournisseur: Fournisseur) {
    this.numero = fournisseur.numero.toString();
    this.nom = fournisseur.nom;
    this.matchCode = fournisseur.matchCode;
    this.adresseLigne1 = fournisseur.adresseLigne1;
    this.adresseLigne2 = fournisseur.adresseLigne2;
    this.localité = fournisseur.localité;
    this.raisonSociale = fournisseur.raisonSociale;
    this.codePays = fournisseur.codePays;
    this.codePostal = fournisseur.codePostal;
    this.contact1 = fournisseur.contact1;
    this.contact2 = fournisseur.contact2;
    this.contact3 = fournisseur.contact3;
    this.numeroTelephone = fournisseur.numeroTelephone;
    this.téléfax = fournisseur.téléfax;
    this.gsm = fournisseur.gsm;
    this.email = fournisseur.email;
    this.commentaire1 = fournisseur.commentaire1;
    this.commentaire2 = fournisseur.commentaire2;
    this.commentaire3 = fournisseur.commentaire3;
    this.compteAssocie = fournisseur.compteAssocie;
    this.nomCompteAssocie = fournisseur.nomCompteAssocie;
    this.compteMaitre = fournisseur.compteMaitre;
    this.nomCompteMaitre = fournisseur.nomCompteMaitre;
    this.compteVenteAchat = fournisseur.compteVenteAchat;
    this.nomCompteVenteAchat = fournisseur.nomCompteVenteAchat;
    this.codeAssujetti = fournisseur.codeAssujetti;
    this.intraCodePays = fournisseur.intraCodePays.toUpperCase();
    this.intraIdentification = fournisseur.intraIdentification;
    this.codeDevise = fournisseur.codeDevise;
    this.compte = fournisseur.compte;
    this.banAdr = fournisseur.banAdr;
    this.banPays = fournisseur.banPays;
    this.banVille = fournisseur.banVille;
    this.banAgence = fournisseur.banAgence;
    this.typeSuivis = fournisseur.typeSuivis;
    this.operationsTriangulaires = fournisseur.operationsTriangulaires;
    this.numeroDomiciliation =
      fournisseur.numeroDomiciliation == 0 ? '' : fournisseur.numeroDomiciliation.toIntString(); // Display empty instead of 0
    this.codeVentilation = fournisseur.codeVentilation.toIntString();
    this.codeRepresentant = fournisseur.codeRepresentant == 0 ? '' : fournisseur.codeRepresentant.toString();
    this.nomRepresentant = fournisseur.nomRepresentant;
    this.codeFamille = fournisseur.codeFamille == 0 ? '' : fournisseur.codeFamille.toIntString();
    this.nomFamille = fournisseur.nomFamille;
    this.codeSecteur = fournisseur.codeSecteur == 0 ? '' : fournisseur.codeSecteur.toIntString();
    this.nomSecteur = fournisseur.nomSecteur;
    this.codeNace = fournisseur.codeNace == 0 ? '' : fournisseur.codeNace.toIntString();
    this.codeLangue = fournisseur.codeLangue;
    this.libelleLangue = fournisseur.libelleLangue;
    this.codePaiement = fournisseur.codePaiement;
    this.libellePaiement = fournisseur.libellePaiement;
    this.nombreDeJoursPaiement = fournisseur.nombreDeJoursPaiement.toIntString();
    this.escompte = fournisseur.escompte.toDecimalString();
    this.joursEscomptes = fournisseur.joursEscomptes.toIntString();
    this.limiteCredit = fournisseur.limiteCredit.toDecimalString();
    this.codePrix = fournisseur.codePrix == 0 ? '' : fournisseur.codePrix.toIntString();
    this.libellePrix = fournisseur.libellePrix;
    this.tarif = fournisseur.tarif;
    this.codeRemise = fournisseur.codeRemise == 0 ? '' : fournisseur.codeRemise.toIntString();
    this.libelleRemise = fournisseur.libelleRemise;
    this.remiseGlobaleDefaut = fournisseur.remiseGlobaleDefaut.toDecimalString();
    this.francoMontant = fournisseur.francoMontant.toDecimalString();
    this.fermetureDu = fournisseur.fermetureDuDate;
    this.fermetureAu = fournisseur.fermetureAuDate;
    this.livraisonGlobale = fournisseur.livraisonGlobale;
    this.tenueBackOrders = fournisseur.tenueBackOrders;
    this.confirmationCommande = fournisseur.confirmationCommande;
    this.documentCertifie = fournisseur.documentCertifie;
    this.facturesGroupees = fournisseur.facturesGroupees;
    this.categorieFacturation = fournisseur.categorieFacturation;
    this.nombreExemplaireFacture =
      fournisseur.nombreExemplaireFacture == 0 ? '' : fournisseur.nombreExemplaireFacture.toIntString();
    this.formulaire = fournisseur.formulaire;
    this.transporteur = fournisseur.transporteur;
    this.periodiciteCommande =
      fournisseur.periodiciteCommande == 0 ? '' : fournisseur.periodiciteCommande.toIntString();
    this.delaiLivraison = fournisseur.delaiLivraison == 0 ? '' : fournisseur.delaiLivraison.toIntString();
    this.conditionsTransport = fournisseur.conditionsTransport;
    this.emissionDocuments = '';
    this.emissionDocuments += fournisseur.emissionDocumentCar1 != '' ? fournisseur.emissionDocumentCar1 : 'N';
    this.emissionDocuments += fournisseur.emissionDocumentCar2 != '' ? fournisseur.emissionDocumentCar2 : 'N';
    this.emissionDocuments += fournisseur.emissionDocumentCar3 != '' ? fournisseur.emissionDocumentCar3 : 'N';
    this.emissionDocuments += fournisseur.emissionDocumentCar4 != '' ? fournisseur.emissionDocumentCar4 : 'N';
    this.emissionDocuments += fournisseur.emissionDocumentCar5 != '' ? fournisseur.emissionDocumentCar5 : 'N';
    this.tournees = [];
    if (fournisseur.tournee1 != 0) this.tournees.push(fournisseur.tournee1.toIntString());
    if (fournisseur.tournee2 != 0) this.tournees.push(fournisseur.tournee2.toIntString());
    if (fournisseur.tournee3 != 0) this.tournees.push(fournisseur.tournee3.toIntString());
  }

  private mapFournisseur() {
    this.fournisseur.numero = this.numero.toNumber();
    this.fournisseur.nom = this.nom;
    this.fournisseur.matchCode = this.matchCode;
    this.fournisseur.adresseLigne1 = this.adresseLigne1;
    this.fournisseur.adresseLigne2 = this.adresseLigne2;
    this.fournisseur.localité = this.localité;
    this.fournisseur.raisonSociale = this.raisonSociale;
    this.fournisseur.codePays = this.codePays;
    this.fournisseur.codePostal = this.codePostal;
    this.fournisseur.contact1 = this.contact1;
    this.fournisseur.contact2 = this.contact2;
    this.fournisseur.contact3 = this.contact3;
    this.fournisseur.numeroTelephone = this.numeroTelephone;
    this.fournisseur.téléfax = this.téléfax;
    this.fournisseur.gsm = this.gsm;
    this.fournisseur.email = this.email;
    this.fournisseur.commentaire1 = this.commentaire1;
    this.fournisseur.commentaire2 = this.commentaire2;
    this.fournisseur.commentaire3 = this.commentaire3;
    this.fournisseur.compteAssocie = this.compteAssocie;
    this.fournisseur.compteMaitre = this.compteMaitre;
    this.fournisseur.compteVenteAchat = this.compteVenteAchat;
    this.fournisseur.codeAssujetti = this.codeAssujetti;
    this.fournisseur.intraCodePays = this.intraCodePays;
    this.fournisseur.intraIdentification = this.intraIdentification;
    this.fournisseur.codeDevise = this.codeDevise;
    this.fournisseur.compte = this.compte;
    this.fournisseur.banAdr = this.banAdr;
    this.fournisseur.banPays = this.banPays;
    this.fournisseur.banVille = this.banVille;
    this.fournisseur.banAgence = this.banAgence;
    this.fournisseur.typeSuivis = this.typeSuivis;
    this.fournisseur.operationsTriangulaires = this.operationsTriangulaires;
    this.fournisseur.numeroDomiciliation = this.numeroDomiciliation != '' ? parseInt(this.numeroDomiciliation) : 0;
    this.fournisseur.codeVentilation = this.codeVentilation != '' ? parseInt(this.codeVentilation) : 0;
    this.fournisseur.codeRepresentant = this.codeRepresentant != '' ? parseInt(this.codeRepresentant) : 0;
    this.fournisseur.codeFamille = this.codeFamille != '' ? parseInt(this.codeFamille) : 0;
    this.fournisseur.codeSecteur = this.codeSecteur != '' ? parseInt(this.codeSecteur) : 0;
    this.fournisseur.codeNace = this.codeNace != '' ? parseInt(this.codeNace) : 0;
    this.fournisseur.codeLangue = this.codeLangue;
    this.fournisseur.codePaiement = this.codePaiement;
    this.fournisseur.nombreDeJoursPaiement =
      this.nombreDeJoursPaiement != '' ? parseInt(this.nombreDeJoursPaiement) : 0;
    this.fournisseur.escompte = this.escompte != '' ? parseInt(this.escompte) : 0;
    this.fournisseur.joursEscomptes = this.joursEscomptes != '' ? parseInt(this.joursEscomptes) : 0;
    this.fournisseur.limiteCredit = this.limiteCredit != '' ? parseInt(this.limiteCredit) : 0;
    this.fournisseur.codePrix = this.codePrix != '' ? parseInt(this.codePrix) : 0;
    this.fournisseur.tarif = this.tarif;
    this.fournisseur.codeRemise = this.codeRemise != '' ? parseInt(this.codeRemise) : 0;
    this.fournisseur.libelleRemise = this.libelleRemise;
    this.fournisseur.remiseGlobaleDefaut = this.remiseGlobaleDefaut != '' ? parseInt(this.remiseGlobaleDefaut) : 0;
    this.fournisseur.francoMontant = this.francoMontant != '' ? parseInt(this.francoMontant) : 0;
    this.fournisseur.fermetureDuDate = this.fermetureDu;
    this.fournisseur.fermetureAuDate = this.fermetureAu;
    this.fournisseur.livraisonGlobale = this.livraisonGlobale;
    this.fournisseur.tenueBackOrders = this.tenueBackOrders;
    this.fournisseur.confirmationCommande = this.confirmationCommande;
    this.fournisseur.documentCertifie = this.documentCertifie;
    this.fournisseur.facturesGroupees = this.facturesGroupees;
    this.fournisseur.categorieFacturation = this.categorieFacturation;
    this.fournisseur.nombreExemplaireFacture =
      this.nombreExemplaireFacture != '' ? parseInt(this.nombreExemplaireFacture) : 0;
    this.fournisseur.formulaire = this.formulaire;
    this.fournisseur.transporteur = this.transporteur;
    this.fournisseur.periodiciteCommande = this.periodiciteCommande != '' ? parseInt(this.periodiciteCommande) : 0;
    this.fournisseur.delaiLivraison = this.delaiLivraison != '' ? parseInt(this.delaiLivraison) : 0;
    this.fournisseur.conditionsTransport = this.conditionsTransport;
    this.mapEmissionDocuments();
    if (this.tournees.length > 0) this.fournisseur.tournee1 = this.tournees[0].toNumber();
    if (this.tournees.length > 1) this.fournisseur.tournee2 = this.tournees[1].toNumber();
    if (this.tournees.length > 2) this.fournisseur.tournee3 = this.tournees[2].toNumber();
  }

  private mapEmissionDocuments() {
    this.fournisseur.emissionDocumentCar1 = this.emissionDocuments.substring(0, 1);
    this.fournisseur.emissionDocumentCar2 = this.emissionDocuments.substring(1, 2);
    this.fournisseur.emissionDocumentCar3 = this.emissionDocuments.substring(2, 3);
    this.fournisseur.emissionDocumentCar4 = this.emissionDocuments.substring(3, 4);
    this.fournisseur.emissionDocumentCar5 = this.emissionDocuments.substring(4, 5);
  }
  private closeDialog() {
    this.display = false;
    this.readonly = true;
    this.intraSaisieReadonly = true;
    this.alertMessage.clear();
    this.successMessage.clear();
    this.setFournisseur(new Fournisseur());
    this.resetCompteValue();
    this.reject();
  }

  private async loadFournisseur(numero: number) {
    this.getLoading = true;

    const fournisseurDTO = await FournisseurApi.getFournisseurByNumero(numero);

    this.setFournisseur(new Fournisseur(fournisseurDTO));
    this.fournisseurBase = new Fournisseur(fournisseurDTO);

    this.getBic();
    this.checkSaisieIntra();

    this.getLoading = false;

    this.autocompleteCompteAssocie.init(this.compteAssocie.toString(), this.nomCompteAssocie);
    this.autocompleteCompteMaitre.init(this.compteMaitre.toString(), this.nomCompteMaitre);
    this.autocompleteCompteVenteAchat.init(this.compteVenteAchat.toString(), this.nomCompteVenteAchat);
    this.autocompleteCodeRepresentant.init(fournisseurDTO.codeRepresentant.toString());
    this.autocompleteCodeFamille.init(fournisseurDTO.codeFamille.toString());
    this.autocompleteCodeSecteur.init(fournisseurDTO.codeSecteur.toString());
  }

  private modifierFournisseur() {
    if (!this.getLoading) {
      this.readonly = false;
      this.$nextTick(() => this.inputNom.focus());
    }
  }

  private deleteFournisseur() {
    console.log('delete');
  }

  private async saveFournisseur() {
    (this.$refs.form as any).validate();
    if (!this.isValid) return false;

    this.saveLoading = true;

    this.mapFournisseur();

    if (this.newRecord) {
      let exists = false;
      if (this.numero.toNumber() != this.fournisseurParams.nextNumero) {
        exists = await FournisseurApi.checkNumero(this.numero.toNumber());
      }
      if (exists) {
        this.alertMessage.show('Ce numéro est déjà utilisé par un fournisseur');
        this.saveLoading = false;
      } else {
        await FournisseurApi.createFournisseur(this.fournisseur)
          .then((numeroFournisseur) => {
            this.fournisseurParams.nextNumero = numeroFournisseur + 1;
            this.fournisseur = this.fournisseurBase;
            this.closeDialog();
          })
          .catch((err) => {
            this.alertMessage.show(
              'Une erreur est survenue lors de la sauvegarde du fournisseur',
              displayAxiosError(err)
            );
            this.readonly = false;
          })
          .finally(() => {
            this.saveLoading = false;
          });
      }
    } else {
      await FournisseurApi.updateFournisseur(new UpdateFournisseur(this.fournisseur), this.fournisseurBase)
        .then(() => {
          this.readonly = true;
          this.successMessage.show('Le fournisseur a été mis à jour avec succès.', '');
          this.resolve(true);
        })
        .finally(() => (this.saveLoading = false));
    }
  }

  private cancelEdit() {
    this.fournisseur = this.fournisseurBase;
    this.setFournisseur(this.fournisseur);
    this.resetCompteValue();
    if (this.newRecord) {
      this.closeDialog();
    } else {
      this.readonly = true;
    }
  }

  private resetCompteValue(){
    if(this.autocompleteCompteAssocie)
      this.autocompleteCompteAssocie.resetCompte();
    if(this.autocompleteCompteMaitre)
      this.autocompleteCompteMaitre.resetCompte();
    if(this.autocompleteCompteVenteAchat)
      this.autocompleteCompteVenteAchat.resetCompte();
  }

  private setCompteAssocie(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteAssocie = 0;
      this.nomCompteAssocie = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteGeneralSearch) {
      this.compteAssocie = compte.numero;
      this.nomCompteAssocie = compte.nom;
      this.$nextTick(() => (this.$refs.autocompleteCompteMaitre as AutocompleteComptesVue)?.focus());
    }
  }

  private setCompteMaitre(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteMaitre = 0;
      this.nomCompteMaitre = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteDeTier) {
      this.compteMaitre = compte.numero;
      this.nomCompteMaitre = compte.nom;
      this.$nextTick(() => (this.$refs.autocompleteCompteVenteAchat as AutocompleteComptesVue)?.focus());
    }
  }

  private setCompteVenteAchat(compte: CompteSearch | CompteGeneralSearch | CompteDeTier | string) {
    if (!compte) {
      this.compteVenteAchat = 0;
      this.nomCompteVenteAchat = '';
    } else if (compte instanceof CompteSearch || compte instanceof CompteGeneralSearch) {
      this.compteVenteAchat = compte.numero;
      this.nomCompteVenteAchat = compte.nom;
      this.$nextTick(() => (this.$refs.ibanField as any)?.focus());
    }
  }

  private checkSaisieIntra() {
    const libelle = this.libellesAssujettis.find((l) => l.code == this.codeAssujetti);

    if (libelle?.saisieIntra == 'Y') {
      this.intraSaisieReadonly = false;
    } else {
      this.intraSaisieReadonly = true;
    }
  }

  private async getDevises() {
    if (this.devises.length <= 1) {
      this.devises = await DeviseApi.getAllDevises();
    }
  }

  private getBic() {
    this.bic = `${this.banAdr}${this.banPays}${this.banVille}${this.banAgence}`;
  }

  private setBic() {
    if (this.bic.length > 0) {
      this.banAdr = this.bic.substring(0, 4);
      this.banPays = this.bic.substring(4, 6);
      this.banVille = this.bic.substring(6, 8);
      this.banAgence = this.bic.substring(8);
    }
  }

  private async getParams() {
    const params = await FournisseurApi.getParams();

    this.fournisseurParams = new FournisseurParams(params);

    this.libellesAssujettis = this.fournisseurParams.libellesAssujettis;
    this.codeSuivis = this.fournisseurParams.codeSuivis;
    this.codesLangues = this.fournisseurParams.langues;
    this.codesPaiement = this.fournisseurParams.codePaiements;
    this.transporteurs = this.fournisseurParams.transporteurs;
  }

  private selectRepresentant(representant: { code: string; nom: string }) {
    this.codeRepresentant = representant.code;
    this.nomRepresentant = representant.nom;
    if (representant != null) {
      this.$nextTick(() => (this.autocompleteCodeFamille as any)?.focus());
    }
  }

  private selectFamille(famille: { code: string; nom: string }) {
    this.codeFamille = famille.code;
    this.nomFamille = famille.nom;
    if (famille != null) {
      this.$nextTick(() => (this.autocompleteCodeSecteur as any)?.focus());
    }
  }

  private selectSecteur(secteur: { code: string; nom: string }) {
    this.codeSecteur = secteur.code;
    this.nomSecteur = secteur.nom;
    if (secteur != null) {
      this.$nextTick(() => (this.paiementField as any)?.focus());
    }
  }

  private changeCodePaiement() {
    this.libellePaiement = this.codesPaiement.find((c) => c.code.toString() == this.codePaiement)?.valeur || '';
  }

  private clickOutside() {
    if (this.readonly) this.closeDialog();
  }

  private async checkNumeroExists() {
    const exists = await FournisseurApi.checkNumero(this.numero.toNumber());

    if (exists) {
      this.numeroErrors.push('Ce numéro existe déjà');
      (this.$refs.numeroInput as HTMLElement).focus();
    } else {
      this.numeroErrors = [];
      this.numeroReadonly = true;
      (this.$refs.raisonInput as HTMLElement).focus();
    }
  }
}
</script>

<style scoped>
.input-spacing > .v-input,
.input-spacing > .autocompleteCompte,
.input-spacing > .autocompleteCode {
  padding-bottom: 8px !important;
}

.correct-alignment-top {
  margin-top: -4px !important;
}
.correct-alignment-bottom {
  padding-bottom: 12px !important;
}

fieldset {
  padding-left: 11px;
  padding-right: 11px;
}
</style>
