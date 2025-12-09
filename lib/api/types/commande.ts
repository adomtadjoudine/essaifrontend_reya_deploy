// Types pour les commandes
import type { Service } from "./service"
import type { DelaiLivraison } from "./delai-livraison"
import type { TypeLinge } from "./type-linge"
import type { Temperature } from "./temperature"
import type { OptionTraitement } from "./option-traitement"

export interface Utilisateur {
  id: number
  nom: string
  prenom?: string
  email: string
  telephone?: string
}

export interface Client {
  id: number
  nom: string
  prenom?: string
  email: string
  telephone?: string
  user?: Utilisateur
}

export interface CreneauCollecte {
  id: number
  nom: string
  heureDebut: string
  heureFin: string
  estActif: boolean
}

export interface LigneCommande {
  id: number
  numeroLigne: string
  quantite: number
  prixUnitaire: number
  montantLigne: number
  sousTotal: number
  commandeId: number
  serviceId: number
  service?: Service
  typeLingeId?: number | null
  typeLinge?: TypeLinge
  temperatureId?: number | null
  temperature?: Temperature
  optionTraitementId?: number | null
  optionTraitement?: OptionTraitement
  prixSupplementaireTypeLinge?: number
  prixSupplementaireTemperature?: number
  prixSupplementaireOptions?: number
  createdAt: string
  updatedAt: string
}

export interface Paiement {
  id: number
  montant: number
  methode: string
  statut: string
  commandeId: number
  numeroTransaction?: string
  referenceExterne?: string
  dateEcheance?: string
  createdAt: string
  updatedAt: string
}

export interface HistoriqueStatut {
  id: number
  nom: string
  description: string | null
  pivot: {
    commandeId: number
    statutId: number
    estNotifie: boolean
    createdAt: string
    updatedAt: string
    createdBy: string | null
  }
}

export interface Commande {
  id: number
  numeroCommande: string
  dateCommande: string
  sousTotal: number
  montantRemise: number | null
  fraisCollecte: number | null
  fraisLivraison: number | null
  prixParKmUtilise: number | null
  distanceCollecte: number | null
  distanceLivraison: number | null
  adresseCollecte: string | null
  adresseLivraison: string | null
  latitudeCollecte: string | null
  longitudeCollelcte: string | null
  latitudeLivraison: string | null
  longitudeLivraison: string | null
  montantTotal: number
  montantPaye: number
  montantRestant: number
  estPayeCompletement: boolean
  noteClient: string | null
  noteInterne: string | null
  estUrgent: boolean
  creneauCollecteId: number
  heureCollecteChoisie?: string | null
  delaiLivraisonId: number
  clientId: number
  client?: Client
  creneauCollecte?: CreneauCollecte
  delaiLivraison?: DelaiLivraison
  lignesCommande?: LigneCommande[]
  paiements?: Paiement[]
  statuts?: HistoriqueStatut[]
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  estActif: boolean
  isArchive: boolean
}

export interface CreateLigneCommandeData {
  quantite: number
  serviceId: number
  prixUnitaire: number
  typeLingeId?: number
  temperatureId?: number
  optionTraitementId?: number
  trancheTarifaireServiceId?: number
}

export interface CreateCommandeData {
  noteClient?: string
  estUrgent?: boolean
  creneauCollecteId: number
  delaiLivraisonId: number
  adresseCollecte?: string
  latitudeCollecte?: string
  longitudeCollecte?: string
  adresseLivraison?: string
  latitudeLivraison?: string
  longitudeLivraison?: string
  lignesCommande: CreateLigneCommandeData[]
  montantRemise?: number
}

export interface UpdateCommandeData {
  noteClient?: string
  noteInterne?: string
  estUrgent?: boolean
  creneauCollecteId?: number
  delaiLivraisonId?: number
  adresseCollecte?: string
  latitudeCollecte?: string
  longitudeCollecte?: string
  adresseLivraison?: string
  latitudeLivraison?: string
  longitudeLivraison?: string
  montantRemise?: number
}

export interface ChangeStatutCommandeData {
  statutId: number
  estNotifie?: boolean
}

export interface AddLigneCommandeData {
  quantite: number
  serviceId: number
  prixUnitaire: number
}

export interface CommandeStatistics {
  nombreTotal: number
  chiffreAffaires: number
  commandesParStatut: Record<string, number>
  montantMoyen: number
}

export interface UpdateQuantityData {
  quantite: number
}

export interface CreatePaiementData {
  montant: number
  methode: string
  statut?: string
  commandeId: number
  numeroTransaction?: string
  referenceExterne?: string
  dateEcheance?: string
}

export interface UpdatePaiementData {
  montant?: number
  methode?: string
  statut?: string
  numeroTransaction?: string
  referenceExterne?: string
  dateEcheance?: string
}

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  hasMore: boolean
}

export interface PaginatedCommandesResponse {
  data: Commande[]
  meta: PaginationMeta
}
